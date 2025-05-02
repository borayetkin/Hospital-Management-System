
import { Process, Billing } from '@/types';
import { mockProcesses, mockBillings, mockAppointments } from './data/mockData';

export class ProcessService {
  async getPatientProcesses(patientId: string): Promise<Process[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Get all appointments for the patient
    const patientAppointments = mockAppointments.filter(app => app.patientId === patientId);
    const appointmentIds = patientAppointments.map(app => app.id);
    
    // Get all processes for these appointments
    const patientProcesses = mockProcesses.filter(proc => appointmentIds.includes(proc.appointmentId));
    
    return patientProcesses;
  }

  async getDoctorPatientProcesses(doctorId: string, patientId: string): Promise<Process[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Get all appointments between this doctor and patient
    const appointments = mockAppointments.filter(
      app => app.doctorId === doctorId && app.patientId === patientId
    );
    const appointmentIds = appointments.map(app => app.id);
    
    // Get all processes for these appointments
    const processes = mockProcesses.filter(proc => appointmentIds.includes(proc.appointmentId));
    
    return processes;
  }

  async getAppointmentProcesses(appointmentId: string): Promise<Process[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockProcesses.filter(proc => proc.appointmentId === appointmentId);
  }

  async getProcessBilling(processId: string): Promise<Billing | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const billing = mockBillings.find(bill => bill.processId === processId);
    return billing || null;
  }

  async addProcess(
    appointmentId: string,
    name: string,
    description: string,
    price: number
  ): Promise<Process> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const newProcess: Process = {
      id: `proc${mockProcesses.length + 1}`,
      name,
      description,
      status: 'scheduled',
      appointmentId,
      price,
      date: new Date().toISOString().split('T')[0],
    };
    
    mockProcesses.push(newProcess);
    
    // Create a pending billing record for this process
    const newBilling: Billing = {
      id: `b${mockBillings.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      amount: price,
      status: 'pending',
      processId: newProcess.id,
    };
    
    mockBillings.push(newBilling);
    
    return newProcess;
  }

  async updateProcessStatus(
    processId: string,
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  ): Promise<Process> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const processIndex = mockProcesses.findIndex(proc => proc.id === processId);
    if (processIndex === -1) {
      throw new Error('Process not found');
    }
    
    const updatedProcess = {
      ...mockProcesses[processIndex],
      status,
    };
    
    mockProcesses[processIndex] = updatedProcess;
    
    return updatedProcess;
  }

  async updateBillingStatus(
    billingId: string,
    status: 'paid' | 'pending' | 'overdue'
  ): Promise<Billing> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const billingIndex = mockBillings.findIndex(bill => bill.id === billingId);
    if (billingIndex === -1) {
      throw new Error('Billing record not found');
    }
    
    const updatedBilling = {
      ...mockBillings[billingIndex],
      status,
    };
    
    mockBillings[billingIndex] = updatedBilling;
    
    return updatedBilling;
  }
}

export const processService = new ProcessService();
