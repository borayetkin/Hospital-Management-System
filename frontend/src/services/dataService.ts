
import { DoctorFilterParams, ResourceFilterParams } from '@/types';
import { doctorService } from './doctorService';
import { patientService } from './patientService';
import { appointmentService } from './appointmentService';
import { resourceService } from './resourceService';
import { processService } from './processService';

class DataService {
  // Doctor related methods
  async getDoctors(filters?: DoctorFilterParams) {
    return doctorService.getDoctors(filters);
  }

  async getDoctor(doctorId: string) {
    return doctorService.getDoctor(doctorId);
  }

  async getDoctorPatients(doctorId: string) {
    return doctorService.getDoctorPatients(doctorId);
  }

  // Patient related methods
  async getPatient(patientId: string) {
    return patientService.getPatient(patientId);
  }

  async getPatientDoctors(patientId: string) {
    return patientService.getPatientDoctors(patientId);
  }

  // Appointment related methods
  async getPatientAppointments(patientId: string) {
    return appointmentService.getPatientAppointments(patientId);
  }

  async getDoctorAppointments(doctorId: string) {
    return appointmentService.getDoctorAppointments(doctorId);
  }

  async getTimeSlots(date: string, doctorId: string) {
    return appointmentService.getTimeSlots(date, doctorId);
  }

  async bookAppointment(
    patientId: string,
    doctorId: string,
    date: string,
    startTime: string,
    endTime: string,
    price: number
  ) {
    return appointmentService.bookAppointment(patientId, doctorId, date, startTime, endTime, price);
  }

  async addReview(reviewData: { 
    appointmentId: string, 
    patientId: string, 
    doctorId: string, 
    rating: number, 
    comment: string 
  }) {
    return appointmentService.addReview(reviewData);
  }

  async getReviewsForDoctor(doctorId: string) {
    return appointmentService.getReviewsForDoctor(doctorId);
  }

  // Resource related methods
  async getResources(filters?: ResourceFilterParams) {
    return resourceService.getResources(filters);
  }

  async reserveResource(
    resourceId: string,
    requesterId: string,
    requesterRole: 'doctor' | 'staff',
    date: string,
    startTime: string,
    endTime: string,
    quantity: number
  ) {
    return resourceService.reserveResource(resourceId, requesterId, requesterRole, date, startTime, endTime, quantity);
  }

  async getResourceReservations(resourceId: string) {
    return resourceService.getResourceReservations(resourceId);
  }

  // Process and billing related methods
  async getPatientProcesses(patientId: string) {
    return processService.getPatientProcesses(patientId);
  }

  async getDoctorPatientProcesses(doctorId: string, patientId: string) {
    return processService.getDoctorPatientProcesses(doctorId, patientId);
  }

  async getAppointmentProcesses(appointmentId: string) {
    return processService.getAppointmentProcesses(appointmentId);
  }

  async getProcessBilling(processId: string) {
    return processService.getProcessBilling(processId);
  }

  async addProcess(
    appointmentId: string,
    name: string,
    description: string,
    price: number
  ) {
    return processService.addProcess(appointmentId, name, description, price);
  }

  async updateProcessStatus(
    processId: string,
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  ) {
    return processService.updateProcessStatus(processId, status);
  }

  async updateBillingStatus(
    billingId: string,
    status: 'paid' | 'pending' | 'overdue'
  ) {
    return processService.updateBillingStatus(billingId, status);
  }
}

// Export an instance of the data service
export const dataService = new DataService();
