import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import appointmentRoutes from './routes/appointments';
import prescriptionRoutes from './routes/prescriptions';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'EHR API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
