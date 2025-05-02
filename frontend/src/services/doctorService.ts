
import { Doctor, DoctorFilterParams, Patient } from '@/types';
import { mockDoctors, mockAppointments, mockPatients } from './data/mockData';

export class DoctorService {
  async getDoctors(filters?: DoctorFilterParams): Promise<Doctor[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredDoctors = [...mockDoctors];
    
    if (filters) {
      if (filters.specialization) {
        filteredDoctors = filteredDoctors.filter(
          doctor => doctor.specialization === filters.specialization
        );
      }
      
      if (filters.minRating !== undefined) {
        filteredDoctors = filteredDoctors.filter(
          doctor => doctor.rating >= filters.minRating
        );
      }
      
      if (filters.maxPrice !== undefined) {
        filteredDoctors = filteredDoctors.filter(
          doctor => doctor.price <= filters.maxPrice
        );
      }
      
      if (filters.availableDay) {
        filteredDoctors = filteredDoctors.filter(
          doctor => doctor.availableDays.includes(filters.availableDay)
        );
      }
    }
    
    return filteredDoctors;
  }

  async getDoctor(doctorId: string): Promise<Doctor | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const doctor = mockDoctors.find(doc => doc.id === doctorId);
    return doctor || null;
  }

  async getDoctorPatients(doctorId: string): Promise<Patient[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get all appointments for the doctor
    const doctorAppointments = mockAppointments.filter(app => app.doctorId === doctorId);
    
    // Get unique patient IDs from these appointments
    const patientIds = [...new Set(doctorAppointments.map(app => app.patientId))];
    
    // Get patient details for these IDs
    const patients = mockPatients.filter(pat => patientIds.includes(pat.id));
    
    return patients;
  }
}

export const doctorService = new DoctorService();
