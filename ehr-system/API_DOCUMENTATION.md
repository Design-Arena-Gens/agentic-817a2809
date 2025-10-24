# EHR System API Documentation

Base URL: `http://localhost:3001/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### POST /api/auth/signup
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "patient",
  "phone": "+1234567890",
  "specialization": "Cardiology"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### POST /api/auth/login
Login with existing credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient",
    "phone": "+1234567890",
    "dob": "1990-01-01T00:00:00.000Z",
    "gender": "male",
    "address": "123 Main St",
    "medicalHistory": "No significant history",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## User Endpoints

### GET /api/users/me
Get current authenticated user profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "patient",
  "phone": "+1234567890",
  "dob": "1990-01-01T00:00:00.000Z",
  "gender": "male",
  "address": "123 Main St",
  "medicalHistory": "No significant history"
}
```

---

### PUT /api/users/me
Update current user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+0987654321",
  "dob": "1990-01-01",
  "gender": "male",
  "address": "456 New St",
  "medicalHistory": "Updated medical history"
}
```

**Response (200):** Updated user object

---

### GET /api/users/doctors
Get list of all doctors.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `specialization` (optional): Filter by specialization

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Dr. Sarah Johnson",
    "email": "sarah@ehr.com",
    "role": "doctor",
    "specialization": "Cardiology",
    "phone": "+1234567891",
    "availabilitySlots": [
      {
        "dayOfWeek": 1,
        "startTime": "09:00",
        "endTime": "17:00"
      }
    ]
  }
]
```

---

### GET /api/users/:id
Get user by ID.

**Headers:** `Authorization: Bearer <token>`

**Response (200):** User object

---

### PUT /api/users/doctors/:id/availability
Update doctor availability slots (Doctor/Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "availabilitySlots": [
    {
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "17:00"
    }
  ]
}
```

---

## Appointment Endpoints

### POST /api/appointments
Create new appointment (Patient only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "doctorId": "507f1f77bcf86cd799439012",
  "date": "2024-01-15",
  "startTime": "10:00",
  "endTime": "10:30",
  "reason": "Regular checkup"
}
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "patientId": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "doctorId": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Dr. Sarah Johnson",
    "specialization": "Cardiology"
  },
  "date": "2024-01-15T00:00:00.000Z",
  "startTime": "10:00",
  "endTime": "10:30",
  "status": "pending",
  "reason": "Regular checkup",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### GET /api/appointments/my-appointments
Get user's appointments.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by status (pending, confirmed, completed, cancelled)
- `upcoming` (optional): true/false - filter upcoming appointments

**Response (200):** Array of appointment objects with populated patient/doctor data

---

### GET /api/appointments/:id
Get appointment by ID.

**Headers:** `Authorization: Bearer <token>`

**Response (200):** Appointment object with populated data

---

### PUT /api/appointments/:id/status
Update appointment status (Doctor/Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "confirmed",
  "notes": "Patient confirmed availability"
}
```

**Response (200):** Updated appointment object

---

### PUT /api/appointments/:id
Update appointment details.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "date": "2024-01-16",
  "startTime": "11:00",
  "endTime": "11:30",
  "reason": "Updated reason",
  "notes": "Updated notes"
}
```

---

### DELETE /api/appointments/:id
Cancel appointment.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Appointment cancelled successfully",
  "appointment": { /* appointment object */ }
}
```

---

## Prescription Endpoints

### POST /api/prescriptions
Create new prescription (Doctor only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "appointmentId": "507f1f77bcf86cd799439013",
  "patientId": "507f1f77bcf86cd799439011",
  "medications": [
    {
      "name": "Lisinopril",
      "dose": "10mg",
      "frequency": "Once daily",
      "duration": "30 days",
      "instructions": "Take in the morning"
    }
  ],
  "notes": "Monitor blood pressure"
}
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "appointmentId": "507f1f77bcf86cd799439013",
  "doctorId": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Dr. Sarah Johnson",
    "specialization": "Cardiology"
  },
  "patientId": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe"
  },
  "medications": [
    {
      "name": "Lisinopril",
      "dose": "10mg",
      "frequency": "Once daily",
      "duration": "30 days",
      "instructions": "Take in the morning"
    }
  ],
  "notes": "Monitor blood pressure",
  "issuedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### GET /api/prescriptions/my-prescriptions
Get user's prescriptions.

**Headers:** `Authorization: Bearer <token>`

**Response (200):** Array of prescription objects with populated data

---

### GET /api/prescriptions/:id
Get prescription by ID.

**Headers:** `Authorization: Bearer <token>`

**Response (200):** Prescription object with populated data

---

### GET /api/prescriptions/appointment/:appointmentId
Get prescriptions for specific appointment.

**Headers:** `Authorization: Bearer <token>`

**Response (200):** Array of prescription objects

---

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**
```json
{
  "message": "Validation error message"
}
```

**401 Unauthorized:**
```json
{
  "message": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "message": "Access denied"
}
```

**404 Not Found:**
```json
{
  "message": "Resource not found"
}
```

**409 Conflict:**
```json
{
  "message": "This time slot is already booked"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Server error",
  "error": "Error details"
}
```

---

## Status Codes Summary

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error
