import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User';
import Appointment from './models/Appointment';
import Prescription from './models/Prescription';

dotenv.config({ path: '.env.local' });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ehr_system';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Appointment.deleteMany({});
    await Prescription.deleteMany({});
    console.log('Cleared existing data');

    const passwordHash = await bcrypt.hash('password123', 10);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@ehr.com',
      passwordHash,
      role: 'admin',
      phone: '+1234567890'
    });

    const doctors = await User.insertMany([
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@ehr.com',
        passwordHash,
        role: 'doctor',
        phone: '+1234567891',
        specialization: 'Cardiology',
        availabilitySlots: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 5, startTime: '09:00', endTime: '13:00' }
        ]
      },
      {
        name: 'Dr. Michael Chen',
        email: 'michael.chen@ehr.com',
        passwordHash,
        role: 'doctor',
        phone: '+1234567892',
        specialization: 'Neurology',
        availabilitySlots: [
          { dayOfWeek: 1, startTime: '10:00', endTime: '18:00' },
          { dayOfWeek: 2, startTime: '10:00', endTime: '18:00' },
          { dayOfWeek: 4, startTime: '10:00', endTime: '18:00' },
          { dayOfWeek: 5, startTime: '10:00', endTime: '18:00' }
        ]
      },
      {
        name: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@ehr.com',
        passwordHash,
        role: 'doctor',
        phone: '+1234567893',
        specialization: 'Pediatrics',
        availabilitySlots: [
          { dayOfWeek: 1, startTime: '08:00', endTime: '16:00' },
          { dayOfWeek: 2, startTime: '08:00', endTime: '16:00' },
          { dayOfWeek: 3, startTime: '08:00', endTime: '16:00' },
          { dayOfWeek: 4, startTime: '08:00', endTime: '16:00' },
          { dayOfWeek: 5, startTime: '08:00', endTime: '12:00' }
        ]
      },
      {
        name: 'Dr. James Wilson',
        email: 'james.wilson@ehr.com',
        passwordHash,
        role: 'doctor',
        phone: '+1234567894',
        specialization: 'Orthopedics',
        availabilitySlots: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }
        ]
      }
    ]);

    const patients = await User.insertMany([
      {
        name: 'John Smith',
        email: 'john.smith@email.com',
        passwordHash,
        role: 'patient',
        phone: '+1234567895',
        dob: new Date('1985-06-15'),
        gender: 'male',
        address: '123 Main St, New York, NY 10001',
        medicalHistory: 'Hypertension, Type 2 Diabetes'
      },
      {
        name: 'Mary Davis',
        email: 'mary.davis@email.com',
        passwordHash,
        role: 'patient',
        phone: '+1234567896',
        dob: new Date('1990-03-22'),
        gender: 'female',
        address: '456 Oak Ave, Los Angeles, CA 90001',
        medicalHistory: 'Asthma, Allergies to penicillin'
      },
      {
        name: 'Robert Brown',
        email: 'robert.brown@email.com',
        passwordHash,
        role: 'patient',
        phone: '+1234567897',
        dob: new Date('1978-11-08'),
        gender: 'male',
        address: '789 Pine Rd, Chicago, IL 60601',
        medicalHistory: 'Previous knee surgery (2018), Mild arthritis'
      },
      {
        name: 'Lisa Anderson',
        email: 'lisa.anderson@email.com',
        passwordHash,
        role: 'patient',
        phone: '+1234567898',
        dob: new Date('1995-07-30'),
        gender: 'female',
        address: '321 Elm St, Houston, TX 77001',
        medicalHistory: 'No significant medical history'
      }
    ]);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(14, 0, 0, 0);

    const appointments = await Appointment.insertMany([
      {
        patientId: patients[0]._id,
        doctorId: doctors[0]._id,
        date: tomorrow,
        startTime: '10:00',
        endTime: '10:30',
        status: 'confirmed',
        reason: 'Regular checkup for hypertension'
      },
      {
        patientId: patients[1]._id,
        doctorId: doctors[1]._id,
        date: nextWeek,
        startTime: '14:00',
        endTime: '14:30',
        status: 'pending',
        reason: 'Headache consultation'
      },
      {
        patientId: patients[2]._id,
        doctorId: doctors[3]._id,
        date: tomorrow,
        startTime: '11:00',
        endTime: '11:30',
        status: 'confirmed',
        reason: 'Knee pain follow-up'
      }
    ]);

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    lastWeek.setHours(10, 0, 0, 0);

    const completedAppt = await Appointment.create({
      patientId: patients[0]._id,
      doctorId: doctors[0]._id,
      date: lastWeek,
      startTime: '10:00',
      endTime: '10:30',
      status: 'completed',
      reason: 'Blood pressure monitoring',
      notes: 'Blood pressure stable. Continue current medication.'
    });

    await Prescription.create({
      appointmentId: completedAppt._id,
      doctorId: doctors[0]._id,
      patientId: patients[0]._id,
      medications: [
        {
          name: 'Lisinopril',
          dose: '10mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take in the morning with water'
        },
        {
          name: 'Metformin',
          dose: '500mg',
          frequency: 'Twice daily',
          duration: '30 days',
          instructions: 'Take with meals'
        }
      ],
      notes: 'Continue monitoring blood pressure. Schedule follow-up in 30 days.',
      issuedAt: lastWeek
    });

    console.log('Database seeded successfully!');
    console.log('\nLogin Credentials:');
    console.log('\nAdmin:');
    console.log('  Email: admin@ehr.com');
    console.log('  Password: password123');
    console.log('\nDoctors:');
    console.log('  Dr. Sarah Johnson - sarah.johnson@ehr.com - password123');
    console.log('  Dr. Michael Chen - michael.chen@ehr.com - password123');
    console.log('  Dr. Emily Rodriguez - emily.rodriguez@ehr.com - password123');
    console.log('  Dr. James Wilson - james.wilson@ehr.com - password123');
    console.log('\nPatients:');
    console.log('  John Smith - john.smith@email.com - password123');
    console.log('  Mary Davis - mary.davis@email.com - password123');
    console.log('  Robert Brown - robert.brown@email.com - password123');
    console.log('  Lisa Anderson - lisa.anderson@email.com - password123');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
