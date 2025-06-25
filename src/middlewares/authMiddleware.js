import jwt from "jsonwebtoken";
import AdminToken from "../models/adminToken.js";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret'; // sebaiknya di .env
dayjs.extend(utc);
dayjs.extend(timezone);

export async function authenticateToken(req, res, next) {
  // Dapatkan token dari header Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // ambil bagian setelah "Bearer "

  if (!token) {
    return res.status(401).json({
      status: 401,
      success: false,
      message: "No token provided"
    });
  }

  try {
    // 1. Verifikasi JWT
    const payload = jwt.verify(token, JWT_SECRET);

    // 2. Cek ke database, apakah token valid & belum expired
    const adminToken = await AdminToken.findOne({
      where: { token }
    });

    if (!adminToken) {
      return res.status(401).json({
        status: 401,
        success: false,
        message: "Token not found or already revoked"
      });
    }

    // Cek expirenya
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

    if (adminToken.expired_at < now) {
      return res.status(401).json({
        status: 401,
        success: false,
        message: "Token expired"
      });
    }

    // Lolos autentikasi, tempelkan data user ke req.user
    req.user = payload;
    req.tokenRow = adminToken;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      // Khusus error JWT expired
      return res.status(401).json({
        status: 401,
        success: false,
        message: "Token has expired",
      });
    } else {
      return res.status(401).json({
        error: err.message,
        status: 401,
        success: false,
        message: "Invalid or expired token",
      });
    }
  }
}
