import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = express.Router();

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, phone, dob, gender, specialization } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      passwordHash,
      role: role || 'patient',
      phone,
      dob,
      gender,
      specialization: role === 'doctor' ? specialization : undefined
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      dob: user.dob,
      gender: user.gender,
      specialization: user.specialization,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return res.status(201).json({ token, user: userResponse });
  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      dob: user.dob,
      gender: user.gender,
      address: user.address,
      medicalHistory: user.medicalHistory,
      specialization: user.specialization,
      availabilitySlots: user.availabilitySlots,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return res.json({ token, user: userResponse });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
