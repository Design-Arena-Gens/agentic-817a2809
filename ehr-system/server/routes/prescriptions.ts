import express, { Response } from 'express';
import Prescription from '../models/Prescription';
import Appointment from '../models/Appointment';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticate, authorize('doctor'), async (req: AuthRequest, res: Response) => {
  try {
    const { appointmentId, patientId, medications, notes } = req.body;

    if (!appointmentId || !patientId || !medications || medications.length === 0) {
      return res.status(400).json({ message: 'Appointment, patient, and medications are required' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.doctorId.toString() !== req.user?.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const prescription = new Prescription({
      appointmentId,
      doctorId: req.user?.userId,
      patientId,
      medications,
      notes,
      issuedAt: new Date()
    });

    await prescription.save();

    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate('appointmentId')
      .populate('doctorId', '-passwordHash')
      .populate('patientId', '-passwordHash');

    return res.status(201).json(populatedPrescription);
  } catch (error: any) {
    console.error('Create prescription error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/my-prescriptions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const filter: any = {};

    if (userRole === 'patient') {
      filter.patientId = userId;
    } else if (userRole === 'doctor') {
      filter.doctorId = userId;
    }

    const prescriptions = await Prescription.find(filter)
      .populate('appointmentId')
      .populate('doctorId', '-passwordHash')
      .populate('patientId', '-passwordHash')
      .sort({ issuedAt: -1 });

    return res.json(prescriptions);
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('appointmentId')
      .populate('doctorId', '-passwordHash')
      .populate('patientId', '-passwordHash');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (
      userRole !== 'admin' &&
      prescription.patientId._id.toString() !== userId &&
      prescription.doctorId._id.toString() !== userId
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    return res.json(prescription);
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/appointment/:appointmentId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const prescriptions = await Prescription.find({ appointmentId: req.params.appointmentId })
      .populate('appointmentId')
      .populate('doctorId', '-passwordHash')
      .populate('patientId', '-passwordHash');

    return res.json(prescriptions);
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
