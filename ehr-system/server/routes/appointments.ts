import express, { Response } from 'express';
import Appointment from '../models/Appointment';
import User from '../models/User';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticate, authorize('patient'), async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId, date, startTime, endTime, reason } = req.body;

    if (!doctorId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Doctor, date, start time, and end time are required' });
    }

    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const existingAppointment = await Appointment.findOne({
      doctorId,
      date: new Date(date),
      startTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(409).json({ message: 'This time slot is already booked' });
    }

    const appointment = new Appointment({
      patientId: req.user?.userId,
      doctorId,
      date: new Date(date),
      startTime,
      endTime,
      reason,
      status: 'pending'
    });

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', '-passwordHash')
      .populate('doctorId', '-passwordHash');

    return res.status(201).json(populatedAppointment);
  } catch (error: any) {
    console.error('Create appointment error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/my-appointments', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status, upcoming } = req.query;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const filter: any = {};

    if (userRole === 'patient') {
      filter.patientId = userId;
    } else if (userRole === 'doctor') {
      filter.doctorId = userId;
    }

    if (status) {
      filter.status = status;
    }

    if (upcoming === 'true') {
      filter.date = { $gte: new Date() };
    }

    const appointments = await Appointment.find(filter)
      .populate('patientId', '-passwordHash')
      .populate('doctorId', '-passwordHash')
      .sort({ date: 1, startTime: 1 });

    return res.json(appointments);
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', '-passwordHash')
      .populate('doctorId', '-passwordHash');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (
      userRole !== 'admin' &&
      appointment.patientId._id.toString() !== userId &&
      appointment.doctorId._id.toString() !== userId
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    return res.json(appointment);
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id/status', authenticate, authorize('doctor', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { status, notes } = req.body;
    const appointmentId = req.params.id;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (req.user?.role === 'doctor' && appointment.doctorId.toString() !== req.user?.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    appointment.status = status;
    if (notes !== undefined) {
      appointment.notes = notes;
    }

    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointmentId)
      .populate('patientId', '-passwordHash')
      .populate('doctorId', '-passwordHash');

    return res.json(updatedAppointment);
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { date, startTime, endTime, reason, notes } = req.body;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (
      userRole !== 'admin' &&
      appointment.patientId.toString() !== userId &&
      appointment.doctorId.toString() !== userId
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (date) appointment.date = new Date(date);
    if (startTime) appointment.startTime = startTime;
    if (endTime) appointment.endTime = endTime;
    if (reason !== undefined) appointment.reason = reason;
    if (notes !== undefined) appointment.notes = notes;

    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointmentId)
      .populate('patientId', '-passwordHash')
      .populate('doctorId', '-passwordHash');

    return res.json(updatedAppointment);
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (
      userRole !== 'admin' &&
      appointment.patientId.toString() !== userId &&
      appointment.doctorId.toString() !== userId
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    return res.json({ message: 'Appointment cancelled successfully', appointment });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
