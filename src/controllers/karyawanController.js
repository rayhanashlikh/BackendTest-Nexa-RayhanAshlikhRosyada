import Karyawan from "../models/karyawan.js";
import generateNip from "../utils/generateNip.js";
import { Op } from "sequelize";
import { Buffer } from "buffer";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const isBase64 = (str) => {
  try {
    // Hapus data:content/extension;base64, jika ada
    if (str.startsWith('data:')) {
      const base64Index = str.indexOf(';base64,');
      if (base64Index !== -1) {
        str = str.substring(base64Index + 8); // Ambil substring setelah ';base64,'
      }
    }
    return Buffer.from(str, 'base64').toString('base64') === str;
  } catch {
    return false;
  }
};

const escapeSpecialChars = (str = '') =>
  str.replace(/'/g, "\\'").replace(/"/g, '\\"');

const createKaryawan = async (req, res) => {
  // Jika body kosong, kembalikan 422
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(422).json({
      status: 422,
      success: false,
      message: "Input data tidak boleh kosong"
    });
  }

  let { nama, alamat, gend, photo, tgl_lahir } = req.body;
  let error = {};

  // Validasi: semua field wajib diisi
  if (!nama)         error.nama   = "Nama wajib diisi";
  if (!alamat)       error.alamat = "Alamat wajib diisi";
  if (!gend)         error.gend   = "Gender wajib diisi";
  else if (!['L', 'P'].includes(gend)) error.gender = "Harus L atau P";
  if (!photo)        error.photo  = "Photo wajib diisi";
  else if (!isBase64(photo)) error.photo = "Photo harus format base64";
  if (!tgl_lahir)    error.tgl_lahir = "Tanggal lahir wajib diisi";

  // Jika ada error, kembalikan response 422
  if (Object.keys(error).length) {
    return res.status(422).json({
      error,
      status: 422,
      success: false,
      message: "Validasi gagal, silakan cek input Anda"
    });
  }

  try {
    // Sanitasi input
    nama   = escapeSpecialChars(nama);
    alamat = escapeSpecialChars(alamat);

    // Generate NIP unik
    let nip, counter = 0, maxTry = 5, isUnique = false;
    while (!isUnique && counter++ < maxTry) {
      nip = await generateNip();
      const exists = await Karyawan.findOne({ where: { nip } });
      if (!exists) isUnique = true;
    }
    if (!isUnique) {
      return res.status(500).json({
        status: 500, success: false,
        message: "Gagal generate NIP unik, coba lagi"
      });
    }

    // Simpan data
    const newKaryawan = await Karyawan.create({
      nip,
      nama,
      alamat,
      gend,
      photo,
      tgl_lahir,
      status: 1,
      insert_at: new Date(),
      insert_by: req.user ? req.user.username : null, // Ambil dari user yang login
      update_at: new Date(),
      update_by: req.user ? req.user.username : null, // Ambil dari user yang
      id: req.user ? req.user.admin_id : null // Ambil ID user yang login
    });

    // Konversi ke objek biasa
    const data = newKaryawan.get({ plain: true });

    // Hapus property yang tidak ingin tampil
    delete data.photo;

    // Format tanggal jika ada (zona waktu Jakarta)
    if (data.tgl_lahir)
      data.tgl_lahir = dayjs(data.tgl_lahir).tz('Asia/Jakarta').format('YYYY-MM-DD');
    if (data.insert_at)
      data.insert_at = dayjs(data.insert_at).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
    if (data.update_at)
      data.update_at = dayjs(data.update_at).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');

    return res.status(201).json({
      data: data,
      status: 201, success: true, message: "Employee created successfully"
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: 500, success: false, message: "Internal error: " + e.message
    });
  }
};

const getListKaryawan = async (req, res) => {
  try {
    // Ambil parameter query (dari ?keyword=...&start=...&count=...)
    // Penanganan field kosong (jika keyword, start, count tidak dikirim, default sudah berlaku)
    let { keyword = "", start = 0, count = 10 } = req.query;

    // Validasi start & count harus angka
    start = parseInt(start, 10);
    count = parseInt(count, 10);
    if (isNaN(start) || start < 0) start = 0;
    if (isNaN(count) || count <= 0) count = 10;

    // Escape karakter khusus supaya LIKE tidak error (escapes: %, _, \)
    function escapeLike(str) {
      return str.replace(/[\\%_]/g, '\\$&');
    }

    let where = {};
    if (keyword.trim() !== "") {
      where.nama = { [Op.like]: `%${escapeLike(keyword)}%` };
    }

    // Query
    const { count: totalData, rows: karyawans } = await Karyawan.findAndCountAll({
      attributes: ['nip', 'nama', 'alamat', 'gend', 'tgl_lahir', 'status'],
      order: [['nip', 'ASC']],
      where,
      offset: start,
      limit: count,
    });

    if (!karyawans || karyawans.length === 0) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Data not found"
      });
    }

    return res.json({
      data: karyawans,
      pagination: {
        total: totalData,
        start,
        count: karyawans.length
      },
      status: 200,
      success: true,
      message: "List of employees retrieved successfully"
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Internal error: " + e.message
    });
  }
};

const updateKaryawan = async (req, res) => {
  // Otentikasi: pastikan user ada di req.user
  if (!req.user) {
    return res.status(401).json({
      status: 401,
      success: false,
      message: "Unauthorized"
    });
  }

  const { nip } = req.params;
  // Pastikan body tidak kosong
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(422).json({
      status: 422,
      success: false,
      message: "Input data tidak boleh kosong"
    });
  }

  let { nama, alamat, gend, photo, tgl_lahir} = req.body;
  let error = {};

  // Validasi: semua field wajib diisi
  if (!nama)         error.nama   = "Nama wajib diisi";
  if (!alamat)       error.alamat = "Alamat wajib diisi";
  if (!gend)         error.gend   = "Gender wajib diisi";
  else if (!['L', 'P'].includes(gend)) error.gend = "Gender harus L atau P";
  if (photo && !isBase64(photo)) error.photo = "Photo harus format base64";
  if (!tgl_lahir)    error.tgl_lahir = "Tanggal lahir wajib diisi";

  // Jika ada error validasi, return 422
  if (Object.keys(error).length) {
    return res.status(422).json({
      error,
      status: 422,
      success: false,
      message: "Validasi gagal, silakan cek input Anda"
    });
  }

  try {
    // Cari karyawan berdasarkan NIP
    const karyawan = await Karyawan.findOne({ where: { nip } });
    if (!karyawan) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Employee not found"
      });
    }

    // Escape special character
    karyawan.nama   = escapeSpecialChars(nama);
    karyawan.alamat = escapeSpecialChars(alamat);
    karyawan.gend   = gend;
    karyawan.photo  = photo ? photo : karyawan.photo;
    karyawan.tgl_lahir = tgl_lahir;
    karyawan.status = karyawan.status || 1;
    karyawan.update_at = new Date();
    karyawan.update_by = req.user ? req.user.username : null;

    await karyawan.save();

    // Konversi ke objek biasa
    const data = karyawan.get({ plain: true });

    // Hapus property yang tidak ingin tampil
    delete data.photo;

    // Format tanggal jika ada (zona waktu Jakarta)
    if (data.tgl_lahir)
      data.tgl_lahir = dayjs(data.tgl_lahir).tz('Asia/Jakarta').format('YYYY-MM-DD');
    if (data.insert_at)
      data.insert_at = dayjs(data.insert_at).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
    if (data.update_at)
      data.update_at = dayjs(data.update_at).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');

    return res.status(201).json({
      data: data,
      status: 201,
      success: true,
      message: "Employee created successfully"
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: 500, success: false, message: "Internal error: " + e.message
    });
  }
};

const disableKaryawan = async (req, res) => {
  // Pastikan user terautentikasi
  if (!req.user) {
    return res.status(401).json({
      status: 401,
      success: false,
      message: "Unauthorized"
    });
  }

  let { nip } = req.params;

  // Validasi field
  let error = {};
  if (!nip) error.nip = "NIP wajib diisi";
  // Menangani special character pada nip jika perlu
  nip = escapeSpecialChars(nip);

  if (Object.keys(error).length) {
    return res.status(422).json({
      error,
      status: 422,
      success: false,
      message: "Validasi gagal, silakan cek input Anda"
    });
  }

  try {
    const karyawan = await Karyawan.findOne({ where: { nip } });
    if (!karyawan) {
      return res.status(404).json({
        status: 404, success: false, message: "Karyawan not found"
      });
    }

    if (karyawan.status === 9) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Karyawan sudah dinonaktifkan"
      });
    }

    karyawan.status = 9; // Set status to disabled
    karyawan.update_at = new Date();
    karyawan.update_by = req.user.username;

    await karyawan.save();

    // Konversi ke plain object
    const data = karyawan.get({ plain: true });

    // Hapus property yang tidak ingin tampil
    delete data.photo;
    
    // Format tanggal jika ada (zona waktu Jakarta)
    if (data.tgl_lahir)
      data.tgl_lahir = dayjs(data.tgl_lahir).tz('Asia/Jakarta').format('YYYY-MM-DD');
    if (data.insert_at)
      data.insert_at = dayjs(data.insert_at).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
    if (data.update_at)
      data.update_at = dayjs(data.update_at).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');

    return res.json({
      data,
      status: 200,
      success: true,
      message: "Employee disabled successfully"
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: 500, success: false, message: "Internal error: " + e.message
    });
  }
};

export { getListKaryawan, createKaryawan, updateKaryawan, disableKaryawan };