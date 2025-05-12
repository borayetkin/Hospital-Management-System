export interface PatientProfile {
  patientid: number;
  name: string;
  email: string;
  dob: string;
  balance?: number;
}

export interface Appointment {
  appointmentid: number;
  patientid: number;
  doctorID: number;
  doctorName: string;
  startTime: string;
  endTime: string;
  status: string;
  rating: number | null;
  review: string | null;
  specialization: string | null;
  processes?: Process[];
}

export interface Billing {
  amount: number;
  paymentStatus: string;
  billingDate?: string;
}

export interface Process {
  processid: number;
  processName: string;
  processDescription: string;
  status: string;
  billing?: Billing;
} 