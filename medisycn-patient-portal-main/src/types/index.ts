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
  patientid: number;
  name: string;
  dob: string;
  email: string;
  phonenumber: string;
  balance: number;
}

export interface DoctorProfile {
  doctorid: number;
  name: string;
  specialization: string;
  rating: number;
  appointmentCount: number;
  experience?: string;
  fee?: number;
  profileImage?: string;
}

export interface Appointment {
  appointmentid: number;
  patientid: number;
  doctorid: number;
  doctorname?: string;
  starttime: string;
  endtime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  rating?: number;
  review?: string;
  specialization?: string;
  processes?: Process[];
}

export interface TimeSlot {
  starttime: string;
  endtime: string;
}

export interface DoctorWithAvailability extends DoctorProfile {
  availableDates?: string[];
}

// Doctor specific types
export interface DoctorStats {
  appointmentCount: number;
  rating: number;
  prescriptionCount: number;
}

// Admin specific types
export interface AppointmentStats {
  totalappointments: number;
  scheduledappointments: number;
  completedappointments: number;
  cancelledappointments: number;
  period: string;
  startdate: string;
  enddate: string;
}

export interface RevenueStats {
  totalrevenue: number;
  billingcount: number;
  avgbillingamount: number;
  period: string;
  startdate: string;
  enddate: string;
}

export interface Process {
  processid: number;
  processname: string;
  processdescription: string;
  status: string;
  appointmentid: number;
  billing?: Billing;
}

export interface Billing {
  billingid: number;
  billingdate: string;
  amount: number;
  paymentstatus: string;
  processid: number;
}
