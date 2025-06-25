# BackendTest Nexa - Rayhan Ashlikh Rosyada

## 🧾 Deskripsi
Project ini merupakan API Backend untuk pengelolaan karyawan dan otentikasi berbasis JWT, dibangun dengan arsitektur modular dan sudah menggunakan Docker untuk kemudahan deployment.

---

## ⚙️ Teknologi

- Node.js dan Express.js  
- MySQL dan Sequelize 
- JWT (JSON Web Token) authentication
- Docker + Alpine base image  
- Stored Procedure + View data karyawan

---

## 🚀 Jalankan Project

1. Clone repository:
    ```bash
    git clone https://github.com/youruser/backendtest-nexa.git
    cd backendtest-nexa
    ```

2. Duplikat file `.env.example` menjadi `.env` dan sesuaikan isinya jika perlu.

3. Jalankan menggunakan Docker Compose:
    ```bash
    docker-compose up --build
    ```

---

## 📁 Struktur Direktori

```
  ├── src/
  │ ├── config/
  │ ├── controllers/
  │ ├── middlewares/
  │ ├── models/
  │ ├── routes/
  │ ├── utils/
  │ ├── app.js
  │ └── server.js
  ├── .dockerignore
  ├── .env
  ├── .env.example
  ├── .gitignore
  ├── Dockerfile
  ├── docker-compose.yml
  ├── package.json
  ├── package-lock.json
  └── README.md
```

---

## 🧬 Note Penting

- Variabel `JWT_SECRET`, serta detail koneksi database bisa dikonfigurasi melalui file `.env` atau langsung di `docker-compose.yml`.

---

Happy Coding! 🚀