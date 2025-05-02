
import { TimeSlot } from '@/types';
import { mockAppointments } from '../data/mockData';

// Helper function to generate time slots
export const generateTimeSlots = (date: string, doctorId: string): TimeSlot[] => {
  const slots = [
    { startTime: '09:00', endTime: '09:30' },
    { startTime: '09:30', endTime: '10:00' },
    { startTime: '10:00', endTime: '10:30' },
    { startTime: '10:30', endTime: '11:00' },
    { startTime: '11:00', endTime: '11:30' },
    { startTime: '11:30', endTime: '12:00' },
    { startTime: '14:00', endTime: '14:30' },
    { startTime: '14:30', endTime: '15:00' },
    { startTime: '15:00', endTime: '15:30' },
    { startTime: '15:30', endTime: '16:00' },
  ];

  // Check if any appointments exist for this doctor at these times
  return slots.map((slot, index) => {
    const isBooked = mockAppointments.some(
      app => 
        app.doctorId === doctorId && 
        app.date === date && 
        app.startTime === slot.startTime
    );
    
    return {
      id: `ts-${index}`,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: !isBooked,
    };
  });
};
