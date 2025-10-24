export type UserRole = 'patient' | 'doctor' | 'admin';

export interface IUser {
  _id: string;
  role: UserRole;
  name: string;
  email: string;
  phone?: string;
  dob?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  medicalHistory?: string;
  specialization?: string;
  availabilitySlots?: IAvailabilitySlot[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IAvailabilitySlot {
  dayOfWeek: number; // 0-6
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface IAppointment {
  _id: string;
  patientId: string;
  doctorId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  patient?: IUser;
  doctor?: IUser;
}

export interface IMedication {
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface IPrescription {
  _id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  medications: IMedication[];
  notes?: string;
  issuedAt: Date;
  appointment?: IAppointment;
  doctor?: IUser;
  patient?: IUser;
}

export interface AuthResponse {
  token: string;
  user: IUser;
}

export interface ApiError {
  message: string;
  error?: string;
}
