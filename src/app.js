import express from 'express';
import authRoutes from './routes/auth.js';
import karyawanRoutes from './routes/karyawan.js';

const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/karyawan', karyawanRoutes);

export default app;