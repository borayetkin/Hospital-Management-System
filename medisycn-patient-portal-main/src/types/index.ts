// User types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Patient' | 'Doctor' | 'Admin' | 'Staff';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface PatientProfile {
  patientID: number;
  name: string;
  dateOfBirth: string;
  email: string;
  phoneNumber: string;
  balance: number;
}

export interface DoctorProfile {
  doctorID: number;
  name: string;
  specialization: string;
  avgRating: number;
  appointmentCount: number;
  experience?: string;
  fee?: number;
  profileImage?: string;
}

export interface Appointment {
  appointmentID: number;
  patientID: number;
  doctorID: number;
  doctorName?: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  rating?: number;
  review?: string;
  specialization?: string;
  processes?: Process[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface DoctorWithAvailability extends DoctorProfile {
  availableDates?: string[];
}

// Doctor specific types
export interface DoctorStats {
  appointmentCount: number;
  avgRating: number;
  prescriptionCount: number;
}

// Admin specific types
export interface AppointmentStats {
  totalAppointments: number;
  scheduledAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  period: string;
  startDate: string;
  endDate: string;
}

export interface RevenueStats {
  totalRevenue: number;
  billingCount: number;
  avgBillingAmount: number;
  period: string;
  startDate: string;
  endDate: string;
}

export interface Process {
  processID: number;
  processName: string;
  processDescription: string;
  status: string;
  appointmentID: number;
  billing?: Billing;
}

export interface Billing {
  billingID: number;
  billingDate: string;
  amount: number;
  paymentStatus: string;
  processID: number;
}
