# EHR System - Electronic Health Record Management

A full-stack Electronic Health Record (EHR) system built with Next.js, Express, MongoDB, and TypeScript.

## Features

### Patient Features
- User registration and authentication
- Profile management with medical history
- Book appointments with doctors
- View appointment history
- Access prescriptions
- Download prescriptions as PDF

### Doctor Features
- View and manage schedule
- Accept/decline appointment requests
- View patient medical history
- Issue prescriptions
- Add visit notes

### System Features
- JWT-based authentication
- Role-based access control (Patient, Doctor, Admin)
- Responsive hospital dashboard UI
- Real-time appointment management
- PDF prescription generation

## Tech Stack

**Frontend:**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Axios

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Prerequisites

- Node.js 18+
- MongoDB running locally or connection string to MongoDB Atlas

## Installation

1. Install dependencies
```bash
npm install
```

2. Set up environment variables

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your MongoDB connection string:
```env
MONGODB_URI=mongodb://localhost:27017/ehr_system
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

3. Start MongoDB

Make sure MongoDB is running locally on port 27017, or update the connection string.

4. Seed the database

```bash
npm run seed
```

This will create demo accounts:

**Doctors:**
- Email: `sarah.johnson@ehr.com` | Password: `password123` | Specialization: Cardiology
- Email: `michael.chen@ehr.com` | Password: `password123` | Specialization: Neurology
- Email: `emily.rodriguez@ehr.com` | Password: `password123` | Specialization: Pediatrics
- Email: `james.wilson@ehr.com` | Password: `password123` | Specialization: Orthopedics

**Patients:**
- Email: `john.smith@email.com` | Password: `password123`
- Email: `mary.davis@email.com` | Password: `password123`
- Email: `robert.brown@email.com` | Password: `password123`
- Email: `lisa.anderson@email.com` | Password: `password123`

**Admin:**
- Email: `admin@ehr.com` | Password: `password123`

## Running the Application

### Development Mode

**Option 1: Run frontend and backend separately**

Terminal 1 - Start the API server:
```bash
npm run dev:server
```

Terminal 2 - Start the Next.js frontend:
```bash
npm run dev
```

**Option 2: Run both concurrently**
```bash
npm run dev:all
```

The application will be available at:
- Frontend: http://localhost:3000
- API: http://localhost:3001

### Production Build

Build the Next.js application:
```bash
npm run build
npm start
```

For the backend, compile TypeScript and run:
```bash
tsc --project tsconfig.server.json
npm run start:server
```

## Project Structure

```
ehr-system/
├── app/                    # Next.js App Router pages
│   ├── patient/           # Patient dashboard and pages
│   ├── doctor/            # Doctor dashboard and pages
│   ├── admin/             # Admin pages
│   ├── login/             # Login page
│   └── signup/            # Signup page
├── components/            # Shared React components
├── lib/                   # Frontend utilities
│   ├── api.ts            # API client
│   ├── auth.tsx          # Authentication context
│   └── pdfGenerator.ts   # PDF generation utility
├── server/                # Express backend
│   ├── config/           # Database configuration
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── middleware/       # Authentication middleware
│   ├── index.ts          # Server entry point
│   └── seed.ts           # Database seeder
├── types/                 # TypeScript type definitions
└── public/               # Static assets
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `GET /api/users/doctors` - Get list of doctors
- `GET /api/users/:id` - Get user by ID

### Appointments
- `POST /api/appointments` - Create appointment (Patient)
- `GET /api/appointments/my-appointments` - Get user's appointments
- `GET /api/appointments/:id` - Get appointment details
- `PUT /api/appointments/:id/status` - Update appointment status (Doctor)
- `DELETE /api/appointments/:id` - Cancel appointment

### Prescriptions
- `POST /api/prescriptions` - Create prescription (Doctor)
- `GET /api/prescriptions/my-prescriptions` - Get user's prescriptions
- `GET /api/prescriptions/:id` - Get prescription details
- `GET /api/prescriptions/appointment/:appointmentId` - Get prescriptions for appointment

## Database Models

### User
- role: patient | doctor | admin
- name, email, passwordHash
- phone, dob, gender, address
- medicalHistory (for patients)
- specialization (for doctors)
- availabilitySlots (for doctors)

### Appointment
- patientId, doctorId
- date, startTime, endTime
- status: pending | confirmed | completed | cancelled
- reason, notes

### Prescription
- appointmentId, doctorId, patientId
- medications: [{ name, dose, frequency, duration, instructions }]
- notes, issuedAt

## Features in Detail

### Authentication Flow
1. User signs up with email, password, and role
2. Password is hashed with bcryptjs
3. JWT token is issued on login
4. Token is stored in localStorage and sent with API requests
5. Backend validates token using middleware

### Appointment Booking
1. Patient selects doctor and time slot
2. System checks for conflicts (double booking prevention)
3. Appointment created with "pending" status
4. Doctor can accept/decline
5. Confirmed appointments appear in both dashboards

### Prescription Management
1. Doctor creates prescription after appointment
2. Multiple medications can be added
3. Patient can view prescriptions
4. PDF can be generated and downloaded

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Protected API routes
- Input validation
- CORS configuration

## License

MIT
