import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface IUserDocument extends Document {
  role: 'patient' | 'doctor' | 'admin';
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  dob?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  medicalHistory?: string;
  specialization?: string;
  availabilitySlots?: IAvailabilitySlot[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AvailabilitySlotSchema = new Schema<IAvailabilitySlot>({
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true }
}, { _id: false });

const UserSchema = new Schema<IUserDocument>({
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    required: true,
    default: 'patient'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  dob: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  address: {
    type: String,
    trim: true
  },
  medicalHistory: {
    type: String,
    trim: true
  },
  specialization: {
    type: String,
    trim: true
  },
  availabilitySlots: [AvailabilitySlotSchema]
}, {
  timestamps: true
});

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export default mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
