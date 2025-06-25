import express from "express";
import { loginAdmin, registerAdmin, logoutAdmin } from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.post("/register", registerAdmin);
router.post("/logout", authenticateToken, logoutAdmin);

export default router;