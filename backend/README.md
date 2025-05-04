# MediSync API Documentation

This document describes the API endpoints, request formats, and response formats for the MediSync Hospital Management System backend.

## Base URL

All API endpoints are relative to the base URL:

```
http://localhost:8000/api/v1
```

## Authentication

The API uses OAuth2 with JWT tokens for authentication.

### Register a New User

**Endpoint:** `/auth/register`  
**Method:** POST  
**Description:** Register a new user in the system  
**Request Body:**

```json
{
  "name": "string",
  "email": "string",
  "identityNumber": "string",
  "password": "string",
  "role": "string",
  "dob": "string", // Required for Patient role
  "phoneNumber": "string", // Required for Patient role
  "specialization": "string", // Required for Doctor role
  "staffRole": "string" // Required for Staff role
}
```

**Response:**

```json
{
  "id": "integer",
  "name": "string",
  "email": "string",
  "role": "string"
}
```

### Login

**Endpoint:** `/auth/token`  
**Method:** POST  
**Description:** Authenticate and get JWT token  
**Request Body:** Form data with:

- `username`: User's email
- `password`: User's password

**Response:**

```json
{
  "access_token": "string",
  "token_type": "bearer",
  "user": {
    "id": "integer",
    "name": "string",
    "email": "string",
    "role": "string"
  }
}
```

## Patient Endpoints

### Get Patient Profile

**Endpoint:** `/patients/profile`  
**Method:** GET  
**Description:** Get the current patient's profile information  
**Authorization:** Patient only  
**Response:**

```json
{
  "patientID": "integer",
  "name": "string",
  "dateOfBirth": "string",
  "email": "string",
  "phoneNumber": "string",
  "balance": "number"
}
```

### Update Patient Profile

**Endpoint:** `/patients/profile`  
**Method:** PUT  
**Description:** Update the current patient's profile information  
**Authorization:** Patient only  
**Request Body:**

```json
{
  "name": "string",
  "email": "string",
  "phoneNumber": "string"
}
```

**Response:** Updated patient profile

### Add Funds to Balance

**Endpoint:** `/patients/balance/add`  
**Method:** PUT  
**Description:** Add funds to patient's balance  
**Authorization:** Patient only  
**Request Body:**

```json
{
  "amount": "number"
}
```

**Response:** Updated patient profile with new balance

## Doctor Endpoints

### Get Doctor Profile

**Endpoint:** `/doctors/{doctor_id}`  
**Method:** GET  
**Description:** Get a doctor's profile information  
**Authorization:** Any authenticated user  
**Response:**

```json
{
  "doctorID": "integer",
  "name": "string",
  "specialization": "string",
  "avgRating": "number",
  "appointmentCount": "integer"
}
```

### Get Current Doctor Profile

**Endpoint:** `/doctors/profile`  
**Method:** GET  
**Description:** Get the current doctor's profile information  
**Authorization:** Doctor only  
**Response:** Same as above

### Get Doctor's Patients

**Endpoint:** `/doctors/patients`  
**Method:** GET  
**Description:** Get list of patients who have had appointments with the doctor  
**Authorization:** Doctor only  
**Response:** Array of patient information

### Get Doctor Statistics

**Endpoint:** `/doctors/stats`  
**Method:** GET  
**Description:** Get statistics for the current doctor  
**Authorization:** Doctor only  
**Response:**

```json
{
  "appointmentCount": "integer",
  "avgRating": "number",
  "prescriptionCount": "integer"
}
```

## Appointment Endpoints

### Get Doctors for Appointments

**Endpoint:** `/appointments/doctors`  
**Method:** GET  
**Description:** Get list of doctors available for appointments with optional filters  
**Authorization:** Any authenticated user  
**Query Parameters:**

- `specialization`: Filter by doctor specialization
- `min_rating`: Filter by minimum average rating

**Response:** Array of doctors with their information

### Get Doctor Available Dates

**Endpoint:** `/appointments/doctor/{doctor_id}/available-dates`  
**Method:** GET  
**Description:** Get all available dates for a specific doctor  
**Authorization:** Any authenticated user  
**Response:** Array of date strings in ISO format

### Get Doctor Time Slots

**Endpoint:** `/appointments/doctor/{doctor_id}/slots`  
**Method:** GET  
**Description:** Get available time slots for a doctor on a specific date  
**Authorization:** Any authenticated user  
**Query Parameters:**

- `date`: Date to check (format: YYYY-MM-DD)

**Response:** Array of available time slots

### Book Appointment

**Endpoint:** `/appointments/book`  
**Method:** POST  
**Description:** Book a new appointment with a doctor  
**Authorization:** Patient only  
**Request Body:**

```json
{
  "doctorID": "integer",
  "startTime": "string",
  "endTime": "string"
}
```

**Response:** Created appointment information

### Get Patient Appointments

**Endpoint:** `/appointments/patient`  
**Method:** GET  
**Description:** Get the current patient's appointments  
**Authorization:** Patient only  
**Query Parameters:**

- `status`: Filter by appointment status

**Response:** Array of appointments

### Get Doctor Appointments

**Endpoint:** `/appointments/doctor`  
**Method:** GET  
**Description:** Get the current doctor's appointments  
**Authorization:** Doctor only  
**Query Parameters:**

- `status`: Filter by appointment status
- `upcoming`: If true, show only future appointments

**Response:** Array of appointments

### Update Appointment Status

**Endpoint:** `/appointments/{appointment_id}/status`  
**Method:** PUT  
**Description:** Update the status of an appointment  
**Authorization:** Doctor only  
**Request Body:**

```json
{
  "status": "string" // One of: Scheduled, Completed, Cancelled
}
```

**Response:** Updated appointment information

### Add Appointment Review

**Endpoint:** `/appointments/{appointment_id}/review`  
**Method:** PUT  
**Description:** Add a review for a completed appointment  
**Authorization:** Patient only  
**Request Body:**

```json
{
  "rating": "number",
  "review": "string" // Optional
}
```

**Response:** Updated appointment with review information

## Admin Endpoints

### Get All Doctors

**Endpoint:** `/admin/doctors`  
**Method:** GET  
**Description:** Get a list of all doctors in the system  
**Authorization:** Admin only  
**Response:** Array of doctors with their information

### Get All Patients

**Endpoint:** `/admin/patients`  
**Method:** GET  
**Description:** Get a list of all patients in the system  
**Authorization:** Admin only  
**Response:** Array of patients with their information

### Get Appointment Statistics

**Endpoint:** `/admin/stats/appointments`  
**Method:** GET  
**Description:** Get appointment statistics for a time period  
**Authorization:** Admin only  
**Query Parameters:**

- `period`: Time period (week, month, quarter, year)

**Response:**

```json
{
  "totalAppointments": "integer",
  "scheduledAppointments": "integer",
  "completedAppointments": "integer",
  "cancelledAppointments": "integer",
  "period": "string",
  "startDate": "string",
  "endDate": "string"
}
```

### Get Revenue Statistics

**Endpoint:** `/admin/stats/revenue`  
**Method:** GET  
**Description:** Get revenue statistics for a time period  
**Authorization:** Admin only  
**Query Parameters:**

- `period`: Time period (week, month, quarter, year)

**Response:**

```json
{
  "totalRevenue": "number",
  "billingCount": "integer",
  "avgBillingAmount": "number",
  "period": "string",
  "startDate": "string",
  "endDate": "string"
}
```

### Generate Report

**Endpoint:** `/admin/reports/generate`  
**Method:** POST  
**Description:** Generate a new report with comprehensive statistics  
**Authorization:** Admin only  
**Response:** Report generation status

## Medical Resources Endpoints

### Get All Resources

**Endpoint:** `/resources/`  
**Method:** GET  
**Description:** Get all medical resources with optional filters  
**Authorization:** Any authenticated user  
**Query Parameters:**

- `name`: Filter by resource name
- `department`: Filter by department
- `available_only`: If true, show only available resources

**Response:** Array of medical resources

### Get Resource by ID

**Endpoint:** `/resources/{resource_id}`  
**Method:** GET  
**Description:** Get a specific medical resource by ID  
**Authorization:** Any authenticated user  
**Response:**

```json
{
  "resourceID": "integer",
  "name": "string",
  "availability": "string"
}
```

### Request Resource

**Endpoint:** `/resources/request`  
**Method:** POST  
**Description:** Request a medical resource  
**Authorization:** Doctor only  
**Request Body:**

```json
{
  "resourceID": "integer",
  "status": "string" // One of: Pending, Approved, Rejected
}
```

**Response:** Request status

### Create Resource

**Endpoint:** `/resources/`  
**Method:** POST  
**Description:** Create a new medical resource  
**Authorization:** Admin or Staff only  
**Request Body:**

```json
{
  "name": "string"
}
```

**Response:** Created resource information

### Update Resource Availability

**Endpoint:** `/resources/{resource_id}/availability`  
**Method:** PUT  
**Description:** Update a resource's availability status  
**Authorization:** Admin or Staff only  
**Query Parameters:**

- `availability`: New availability status (Available, In Use, Maintenance)

**Response:** Update status

## Data Models

### User

- `userid`: Unique identifier
- `name`: Full name
- `email`: Email address
- `identity_number`: Personal identity number
- `password`: Hashed password
- `role`: User role (Patient, Doctor, Staff, Admin)

### Patient

- `patientID`: Unique identifier (same as userID)
- `name`: Full name
- `dateOfBirth`: Date of birth
- `email`: Email address
- `phoneNumber`: Contact phone number
- `balance`: Current account balance

### Doctor

- `doctorID`: Unique identifier (same as employeeID)
- `name`: Full name
- `specialization`: Medical specialization
- `avgRating`: Average rating from appointments
- `appointmentCount`: Number of appointments

### Appointment

- `appointmentID`: Unique identifier
- `patientID`: Patient ID
- `doctorID`: Doctor ID
- `startTime`: Appointment start time
- `endTime`: Appointment end time
- `status`: Appointment status (Scheduled, Completed, Cancelled)
- `rating`: Patient's rating for completed appointment
- `review`: Patient's review text

### Medical Resource

- `resourceID`: Unique identifier
- `name`: Resource name
- `availability`: Availability status (Available, In Use, Maintenance)

## Error Responses

All endpoints return standard HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Authenticated but not authorized for the action
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

Error responses include a JSON object with an error detail:

```json
{
  "detail": "Error message"
}
```

## Authentication Flow

1. Register a new user using `/auth/register`
2. Login with `/auth/token` to get a JWT token
3. Include the token in the `Authorization` header for all subsequent requests:
   ```
   Authorization: Bearer {token}
   ```

## Example Flows

### Patient Appointment Booking Flow

1. Get doctors by specialization: `GET /appointments/doctors?specialization=Cardiology`
2. Get available dates for chosen doctor: `GET /appointments/doctor/5/available-dates`
3. Get time slots for chosen date: `GET /appointments/doctor/5/slots?date=2023-06-15`
4. Book appointment: `POST /appointments/book`
5. Review after appointment: `PUT /appointments/42/review`

### Doctor Workflow

1. View upcoming appointments: `GET /appointments/doctor?upcoming=true`
2. Update appointment status: `PUT /appointments/42/status`
3. Request medical resource: `POST /resources/request`

### Admin Analytics

1. Get appointment statistics: `GET /admin/stats/appointments?period=month`
2. Get revenue statistics: `GET /admin/stats/revenue?period=quarter`
3. Generate comprehensive report: `POST /admin/reports/generate`
