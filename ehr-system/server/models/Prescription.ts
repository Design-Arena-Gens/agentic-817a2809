import mongoose, { Schema, Document } from 'mongoose';

export interface IMedication {
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface IPrescriptionDocument extends Document {
  appointmentId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  medications: IMedication[];
  notes?: string;
  issuedAt: Date;
}

const MedicationSchema = new Schema<IMedication>({
  name: { type: String, required: true },
  dose: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
  instructions: { type: String }
}, { _id: false });

const PrescriptionSchema = new Schema<IPrescriptionDocument>({
  appointmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medications: {
    type: [MedicationSchema],
    required: true,
    validate: [
      (val: IMedication[]) => val.length > 0,
      'At least one medication is required'
    ]
  },
  notes: {
    type: String,
    trim: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

PrescriptionSchema.index({ patientId: 1, issuedAt: -1 });
PrescriptionSchema.index({ doctorId: 1, issuedAt: -1 });
PrescriptionSchema.index({ appointmentId: 1 });

export default mongoose.models.Prescription || mongoose.model<IPrescriptionDocument>('Prescription', PrescriptionSchema);
