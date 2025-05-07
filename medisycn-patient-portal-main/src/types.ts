export interface PatientProfile {
  patientid: number;
  name: string;
  email: string;
  dob: string;
}

export interface Appointment {
  appointmentid: number;
  patientid: number;
  doctorid: number;
  doctorname: string;
  starttime: string;
  endtime: string;
  status: string;
  rating: number | null;
  review: string | null;
  specialization: string | null;
}

export interface Process {
  processid: number;
  processName: string;
  processDescription: string;
  status: string;
  doctor_name: string;
  process_date: string;
  amount: number;
  paymentStatus: string | null;
} 