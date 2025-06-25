import Admin from "../models/admin.js";
import AdminToken from "../models/adminToken.js";
import { encryptPassword, decryptPassword } from "../utils/encryption.js";
import jwt from "jsonwebtoken";
import { Op } from 'sequelize';
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';
dayjs.extend(utc);
dayjs.extend(timezone);

const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ where: { username } });
    if (!admin) return res.status(401).json({
      status: 401, success: false, message: "Wrong username or password"
    });

    const dbPwdEncrypted =
      Buffer.isBuffer(admin.password)
        ? admin.password.toString('base64')
        : admin.password;
    const dbPwdDecrypted = decryptPassword(dbPwdEncrypted);

    if (dbPwdDecrypted !== password) {
      return res.status(401).json({
        status: 401, success: false, message: "Wrong username or password"
      });
    }

    const payload = { admin_id: admin.id, username: admin.username };
    const expiresIn = 60 * 60;
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn });

    const expired_at = dayjs().utc().add((expiresIn), 'second').format('YYYY-MM-DD HH:mm:ss');
    const nowWIB = dayjs().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');

    await AdminToken.destroy({
      where: { id_admin: admin.id, expired_at: { [Op.lte]: nowWIB } }
    });

    await AdminToken.create({ id_admin: admin.id, token, expired_at });
    // console.log("New token created:", test);
    // throw new Error("New token created: " + JSON.stringify(test));
    // Tambahkan +7 jam untuk expired_at
    const expiredAtWib = dayjs(expired_at).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');

    return res.json({
      data: { token, expired_at: expiredAtWib },
      status: 200, success: true, message: "Login successful"
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: 500, success: false, message: "Internal error: " + e.message
    });
  }
};

const registerAdmin = async (req, res) => {
  const { username, password, password_confirmation } = req.body;

  try {
    if (!username || !password || !password_confirmation) {
      return res.status(400).json({
        status: 400, success: false,
        message: "Username, password, and password_confirmation are required"
      });
    }

    if (password !== password_confirmation) {
      return res.status(400).json({
        status: 400, success: false,
        message: "Passwords do not match with password_confirmation"
      });
    }

    const existingAdmin = await Admin.findOne({ where: { username } });
    if (existingAdmin) {
      return res.status(400).json({
        status: 400, success: false, message: "Username already exists"
      });
    }

    const encryptedPassword = encryptPassword(password);

    const newAdmin = await Admin.create({
      username,
      password: Buffer.from(encryptedPassword, 'base64'),
    });

    return res.status(201).json({
      data: { id: newAdmin.id, username: newAdmin.username },
      status: 201, success: true, message: "Admin registered successfully"
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: 500, success: false, message: "Internal error: " + e.message
    });
  }
};

const logoutAdmin = async (req, res) => {
  const authHeader = req.headers['authorization'] || req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(400).json({
      status: 400, success: false,
      message: "No token provided in header Authorization"
    });
  }

  try {
    await AdminToken.destroy({ where: { token } });
    return res.json({
      status: 200, success: true, message: "Logout successful"
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: 500, success: false, message: "Internal error: " + e.message
    });
  }
};

export { loginAdmin, registerAdmin, logoutAdmin };
