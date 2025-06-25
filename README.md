# 🚧 BackendTest Nexa - Rayhan Ashlikh Rosyada

API Backend ini dirancang untuk manajemen data karyawan dan otentikasi pengguna menggunakan JWT. Proyek dikembangkan menggunakan Node.js dan Express.js dengan koneksi ke database MySQL menggunakan Sequelize ORM. Seluruh layanan dikemas dalam Docker untuk kemudahan setup dan deployment.

---

## 🔧 Stack Teknologi

- **Node.js** & **Express.js**
- **MySQL** dengan **Sequelize ORM**
- **JWT (JSON Web Token)** untuk otentikasi
- **Docker** dengan base image **Alpine**
- **Stored Procedure** dan **View** untuk pengelolaan data

---

## ▶️ Cara Menjalankan

### 1. Clone Repository

```bash
git clone https://github.com/youruser/backendtest-nexa.git
cd backendtest-nexa
```

### 2. Buat File `.env`

Salin `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Lalu sesuaikan konfigurasi seperti `DB_HOST`, `DB_USER`, `DB_PASSWORD`, dan `JWT_SECRET`.

### 3. Jalankan via Docker Compose

```bash
docker-compose up --build
```

Docker akan otomatis membangun image dan menjalankan kontainer pada port yang ditentukan.

---

## 📂 Struktur Proyek

```
backendtest-nexa/
├── src/
│   ├── config/          # Konfigurasi database, dsb.
│   ├── controllers/     # Logika endpoint API
│   ├── middlewares/     # Middleware seperti autentikasi
│   ├── models/          # Definisi model Sequelize
│   ├── routes/          # Routing Express
│   ├── utils/           # Helper functions
│   ├── app.js           # Inisialisasi aplikasi
│   └── server.js        # HTTP server entry point
├── .env
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── package.json
├── package-lock.json
└── README.md
```

---

## ⚠️ Catatan Penting

- Pastikan database beserta seluruh **stored procedure** dan **view** telah tersedia sebelum menjalankan aplikasi.
- Konfigurasi rahasia seperti `JWT_SECRET` wajib diatur di `.env` untuk keamanan aplikasi.

---

Terima kasih telah menggunakan proyek ini 🙌  
Selamat ngoding! 🧠✨