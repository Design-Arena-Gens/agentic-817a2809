import express, { Response } from 'express';
import User from '../models/User';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, dob, gender, address, medicalHistory } = req.body;

    const user = await User.findById(req.user?.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (dob !== undefined) user.dob = dob;
    if (gender) user.gender = gender;
    if (address !== undefined) user.address = address;
    if (medicalHistory !== undefined) user.medicalHistory = medicalHistory;

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    return res.json(userResponse);
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/doctors', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { specialization } = req.query;

    const filter: any = { role: 'doctor' };
    if (specialization) {
      filter.specialization = { $regex: specialization, $options: 'i' };
    }

    const doctors = await User.find(filter).select('-passwordHash');

    return res.json(doctors);
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/patients', authenticate, authorize('doctor', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-passwordHash');
    return res.json(patients);
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/doctors/:id/availability', authenticate, authorize('doctor', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { availabilitySlots } = req.body;
    const doctorId = req.params.id;

    if (req.user?.role === 'doctor' && req.user?.userId !== doctorId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    doctor.availabilitySlots = availabilitySlots;
    await doctor.save();

    const doctorResponse = doctor.toObject();
    delete doctorResponse.passwordHash;

    return res.json(doctorResponse);
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
