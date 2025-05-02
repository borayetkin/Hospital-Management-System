
import { Appointment, Review, TimeSlot } from '@/types';
import { mockAppointments, mockReviews } from './data/mockData';
import { generateTimeSlots } from './utils/timeSlots';

export class AppointmentService {
  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return mockAppointments.filter(app => app.patientId === patientId);
  }

  async getDoctorAppointments(doctorId: string): Promise<Appointment[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return mockAppointments.filter(app => app.doctorId === doctorId);
  }

  async getTimeSlots(date: string, doctorId: string): Promise<TimeSlot[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return generateTimeSlots(date, doctorId);
  }

  async bookAppointment(
    patientId: string,
    doctorId: string,
    date: string,
    startTime: string,
    endTime: string,
    price: number
  ): Promise<Appointment> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const newAppointment: Appointment = {
      id: `a${mockAppointments.length + 1}`,
      patientId,
      doctorId,
      date,
      startTime,
      endTime,
      status: 'scheduled',
      price,
      isPaid: true,
      reason: 'General consultation',
    };
    
    mockAppointments.push(newAppointment);
    return newAppointment;
  }

  async addReview({ 
    appointmentId, 
    patientId, 
    doctorId, 
    rating, 
    comment 
  }: { 
    appointmentId: string, 
    patientId: string, 
    doctorId: string, 
    rating: number, 
    comment: string 
  }): Promise<Review> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newReview: Review = {
      id: `rev${mockReviews.length + 1}`,
      appointmentId,
      patientId,
      doctorId,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
    };
    
    mockReviews.push(newReview);
    return newReview;
  }

  async getReviewsForDoctor(doctorId: string): Promise<Review[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockReviews.filter(review => review.doctorId === doctorId);
  }
}

export const appointmentService = new AppointmentService();
