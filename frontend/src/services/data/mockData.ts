import { Patient, Doctor, Staff, Appointment, Process, Billing, MedicalResource, ResourceReservation, Review } from '@/types';

// Mock data for patients
export const mockPatients: Patient[] = [
  {
    id: 'p1',
    name: 'John Doe',
    email: 'patient@example.com',
    role: 'patient',
    balance: 1000,
    phoneNumber: '123-456-7890',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    id: 'p2',
    name: 'Alice Smith',
    email: 'alice@example.com',
    role: 'patient',
    balance: 500,
    phoneNumber: '987-654-3210',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    id: 'p3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'patient',
    balance: 250,
    phoneNumber: '555-123-4567',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
];

// Mock data for doctors
export const mockDoctors: Doctor[] = [
  {
    id: 'd1',
    name: 'Dr. Emma Smith',
    email: 'doctor@example.com',
    role: 'doctor',
    specialization: 'Cardiology',
    rating: 4.8,
    experience: 8,
    bio: 'Specialized in cardiovascular health with 8+ years of experience.',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Friday'],
    price: 150,
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    id: 'd2',
    name: 'Dr. Michael Brown',
    email: 'michael@example.com',
    role: 'doctor',
    specialization: 'Neurology',
    rating: 4.5,
    experience: 12,
    bio: 'Expert in neurological disorders and treatments.',
    availableDays: ['Tuesday', 'Thursday', 'Saturday'],
    price: 200,
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
  },
  {
    id: 'd3',
    name: 'Dr. Sarah Lee',
    email: 'sarah@example.com',
    role: 'doctor',
    specialization: 'Pediatrics',
    rating: 4.9,
    experience: 5,
    bio: 'Passionate about providing the best care for children.',
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    price: 120,
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
  },
];

// Mock data for staff
export const mockStaff: Staff[] = [
  {
    id: 's1',
    name: 'Sarah Johnson',
    email: 'staff@example.com',
    role: 'staff',
    department: 'Radiology',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    id: 's2',
    name: 'David Williams',
    email: 'david@example.com',
    role: 'staff',
    department: 'Laboratory',
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
  },
];

// Mock data for appointments
export const mockAppointments: Appointment[] = [
  {
    id: 'a1',
    patientId: 'p1',
    doctorId: 'd1',
    date: '2024-07-15',
    startTime: '10:00',
    endTime: '10:30',
    status: 'scheduled',
    price: 150,
    isPaid: false,
    reason: 'Regular check-up',
  },
  {
    id: 'a2',
    patientId: 'p2',
    doctorId: 'd2',
    date: '2024-07-16',
    startTime: '14:00',
    endTime: '14:30',
    status: 'completed',
    price: 200,
    isPaid: true,
    reason: 'Neurology consultation',
  },
  {
    id: 'a3',
    patientId: 'p1',
    doctorId: 'd3',
    date: '2024-07-17',
    startTime: '09:00',
    endTime: '09:30',
    status: 'scheduled',
    price: 120,
    isPaid: false,
    reason: 'Pediatric check-up',
  },
  {
    id: 'a4',
    patientId: 'p3',
    doctorId: 'd1',
    date: '2024-07-18',
    startTime: '11:00',
    endTime: '11:30',
    status: 'completed',
    price: 150,
    isPaid: true,
    reason: 'Cardiology follow-up',
  },
  {
    id: 'a5',
    patientId: 'p2',
    doctorId: 'd3',
    date: '2024-07-19',
    startTime: '15:00',
    endTime: '15:30',
    status: 'scheduled',
    price: 120,
    isPaid: false,
    reason: 'Vaccination',
  },
];

// Mock data for processes
export const mockProcesses: Process[] = [
  {
    id: 'pr1',
    name: 'Blood Test',
    description: 'Comprehensive blood analysis',
    status: 'completed',
    appointmentId: 'a2',
    price: 80,
    date: '2024-07-16',
  },
  {
    id: 'pr2',
    name: 'X-Ray Scan',
    description: 'Chest X-Ray for diagnosis',
    status: 'scheduled',
    appointmentId: 'a1',
    price: 100,
    date: '2024-07-15',
  },
  {
    id: 'pr3',
    name: 'Physical Therapy',
    description: 'Rehabilitation session',
    status: 'in_progress',
    appointmentId: 'a4',
    price: 50,
    date: '2024-07-18',
  },
];

// Mock data for billings
export const mockBillings: Billing[] = [
  {
    id: 'b1',
    date: '2024-07-16',
    amount: 80,
    status: 'paid',
    processId: 'pr1',
  },
  {
    id: 'b2',
    date: '2024-07-15',
    amount: 100,
    status: 'pending',
    processId: 'pr2',
  },
  {
    id: 'b3',
    date: '2024-07-18',
    amount: 50,
    status: 'overdue',
    processId: 'pr3',
  },
];

// Mock data for medical resources
export const mockResources: MedicalResource[] = [
  {
    id: 'r1',
    name: 'MRI Machine',
    type: 'Imaging',
    department: 'Radiology',
    isAvailable: true,
    quantity: 1,
  },
  {
    id: 'r2',
    name: 'Ventilator',
    type: 'Life Support',
    department: 'ICU',
    isAvailable: true,
    quantity: 5,
  },
  {
    id: 'r3',
    name: 'Surgical Kit',
    type: 'Equipment',
    department: 'Surgery',
    isAvailable: false,
    quantity: 10,
  },
];

// Mock data for resource reservations
export const mockResourceReservations: ResourceReservation[] = [
  {
    id: 'rr1',
    resourceId: 'r1',
    requesterId: 'd2',
    requesterRole: 'doctor',
    date: '2024-07-20',
    startTime: '10:00',
    endTime: '11:00',
    quantity: 1,
    status: 'approved',
  },
  {
    id: 'rr2',
    resourceId: 'r2',
    requesterId: 's1',
    requesterRole: 'staff',
    date: '2024-07-21',
    startTime: '14:00',
    endTime: '15:00',
    quantity: 2,
    status: 'pending',
  },
];

// Add Admin user
export const mockAdmins = [
  {
    id: 'a1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    avatar: 'https://randomuser.me/api/portraits/men/10.jpg',
  }
];

// Add mock reviews
export const mockReviews: Review[] = [
  {
    id: 'rev1',
    appointmentId: 'a2',
    patientId: 'p2',
    doctorId: 'd2',
    rating: 4.5,
    comment: 'Dr. Brown was very professional and knowledgeable.',
    date: '2024-07-16',
  },
  {
    id: 'rev2',
    appointmentId: 'a4',
    patientId: 'p3',
    doctorId: 'd1',
    rating: 5.0,
    comment: 'Excellent service and care. Highly recommended!',
    date: '2024-07-18',
  }
];
