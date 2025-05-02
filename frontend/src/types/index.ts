export type UserRole = 'patient' | 'doctor' | 'staff' | 'admin';

export interface User {
  userID: number;
  name: string;
  email: string;
  identityNumber: string;
  role: UserRole;
}

export interface Patient extends User {
  patientID: number;
  DOB: string;
  phoneNumber: string;
  Balance: number;
  role: 'patient';
}

export interface Doctor extends User {
  specialization: string;
  doctorLocation: string;
  deptName: string;
  role: 'doctor';
}

export interface Staff extends Employee {
  role: 'staff';
}

export interface Admin extends User {
  AdminID: number;
  role: 'admin';
}

export interface Appointment {
  appointmentID: number;
  status: string;
  rating: number | null;
  review: string | null;
  patientID: number;
  doctorID: number;
  startTime: string;
  endTime: string;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Review {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  rating: number;
  comment: string;
  date: string;
}

export interface MedicalResource {
  resourceID: number;
  name: string;
  availability: string;
}

export interface ResourceReservation {
  id: string;
  resourceId: string;
  requesterId: string;
  requesterRole: UserRole;
  date: string;
  startTime: string;
  endTime: string;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
}

export interface DoctorFilterParams {
  specialization?: string;
  minRating?: number;
  maxPrice?: number;
  availableDay?: string;
}

export interface ResourceFilterParams {
  type?: string;
  department?: string;
  availableOnly?: boolean;
}

export interface Process {
  processID: number;
  processName: string;
  processDescription: string;
  status: string;
  appointmentID: number;
}

export interface Billing {
  billingID: number;
  billingDate: string;
  amount: number;
  paymentStatus: string;
  processID: number;
}

export interface DoctorStatistics {
  reportID: number;
  statID: number;
  doctorID: number;
  prescriptionCount: number;
  appointmentCount: number;
  totalRevenue: number;
  reportDate: string;
  ratings: number;
}

export interface PatientStatistics {
  reportID: number;
  statID: number;
  patientID: number;
  totalAppointments: number;
  totalProcesses: number;
  totalPaid: number;
  lastVisit: string;
  reportDate: string;
}

export interface Employee extends User {
  employeeID: number;
  salary: number;
}

export interface HospitalAdministrator extends Employee {
  role: 'admin';
}

export interface Medication {
  medicationName: string;
  description: string;
  information: string;
}

export interface Prescription {
  medicationName: string;
  appointmentID: number;
}

export interface Report {
  reportID: number;
  created_by: number;
  time_stamp: string;
}

export interface EquipmentStatistics {
  statID: number;
  reportID: number;
  resourceID: number;
  usageCount: number;
  lastUsedDate: string;
  totalRequests: number;
}

export interface Request {
  doctorID: number;
  resourceID: number;
  status: string;
}

export interface Department {
  deptName: string;
  deptLocation: string;
}

export interface DoctorPatient {
  doctorID: number;
  patientID: number;
}
