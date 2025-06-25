import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import {
  getListKaryawan,
  createKaryawan,
  updateKaryawan,
  disableKaryawan
} from '../controllers/karyawanController.js';

const router = express.Router();

router.get('/', authenticateToken, getListKaryawan);
router.post('/', authenticateToken, createKaryawan);
router.put('/:nip', authenticateToken, updateKaryawan);
router.patch('/:nip', authenticateToken, disableKaryawan);

export default router;