
export type UserRole = 'patient' | 'doctor' | 'staff' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Patient extends User {
  role: 'patient';
  balance: number;
  phoneNumber: string;
}

export interface Doctor extends User {
  role: 'doctor';
  specialization: string;
  rating: number;
  experience: number;
  bio: string;
  availableDays: string[];
  price: number;
}

export interface Staff extends User {
  role: 'staff';
  department: string;
}

export interface Admin extends User {
  role: 'admin';
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  price: number;
  isPaid: boolean;
  reason?: string;
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
  id: string;
  name: string;
  type: string;
  department: string;
  isAvailable: boolean;
  quantity: number;
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
  id: string;
  name: string;
  description: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  appointmentId: string;
  price: number;
  date: string;
}

export interface Billing {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  processId: string;
}

export interface DoctorStatistics {
  doctorId: string;
  appointmentCount: number;
  completedAppointments: number;
  cancelledAppointments: number;
  averageRating: number;
  totalRevenue: number;
  period: 'weekly' | 'monthly' | 'yearly';
  prescriptionCount: number;
  reportDate: string;
}

export interface PatientStatistics {
  patientId: string;
  totalAppointments: number;
  totalProcesses: number;
  totalPaid: number;
  lastVisit: string;
  reportDate: string;
}
