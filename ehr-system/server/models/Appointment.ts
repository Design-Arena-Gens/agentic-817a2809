import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointmentDocument extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  reason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointmentDocument>({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
    required: true
  },
  reason: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

AppointmentSchema.index({ doctorId: 1, date: 1, startTime: 1 });
AppointmentSchema.index({ patientId: 1, date: 1 });

export default mongoose.models.Appointment || mongoose.model<IAppointmentDocument>('Appointment', AppointmentSchema);
