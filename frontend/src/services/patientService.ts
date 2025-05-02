
import { Patient, Doctor, PatientStatistics, Billing } from '@/types';
import { mockPatients, mockAppointments, mockDoctors, mockProcesses, mockBillings } from './data/mockData';

export class PatientService {
  async getPatient(patientId: string): Promise<Patient | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const patient = mockPatients.find(pat => pat.id === patientId);
    return patient || null;
  }

  async getPatientDoctors(patientId: string): Promise<Doctor[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get all appointments for the patient
    const patientAppointments = mockAppointments.filter(app => app.patientId === patientId);
    
    // Get unique doctor IDs from these appointments
    const doctorIds = [...new Set(patientAppointments.map(app => app.doctorId))];
    
    // Get doctor details for these IDs
    const doctors = mockDoctors.filter(doc => doctorIds.includes(doc.id));
    
    return doctors;
  }

  async updatePatientBalance(patientId: string, amount: number): Promise<Patient | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find the patient
    const patientIndex = mockPatients.findIndex(pat => pat.id === patientId);
    
    if (patientIndex === -1) {
      return null;
    }
    
    // Update the patient's balance
    const updatedPatient = {
      ...mockPatients[patientIndex],
      balance: mockPatients[patientIndex].balance + amount
    };
    
    // Update the mock data
    mockPatients[patientIndex] = updatedPatient;
    
    return updatedPatient;
  }

  async getPatientStatistics(patientId: string): Promise<PatientStatistics | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Get all appointments for the patient
    const patientAppointments = mockAppointments.filter(app => app.patientId === patientId);
    
    // Get all processes for the patient's appointments
    const appointmentIds = patientAppointments.map(app => app.id);
    const patientProcesses = mockProcesses.filter(process => 
      appointmentIds.includes(process.appointmentId)
    );
    
    // Get all billings for the patient's processes
    const processIds = patientProcesses.map(process => process.id);
    const patientBillings = mockBillings.filter(billing => 
      processIds.includes(billing.processId)
    );
    
    // Calculate total paid
    const totalPaid = patientBillings.reduce((sum, billing) => {
      if (billing.status === 'paid') {
        return sum + billing.amount;
      }
      return sum;
    }, 0);
    
    // Find the most recent appointment
    const sortedAppointments = [...patientAppointments].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const lastVisit = sortedAppointments.length > 0 ? sortedAppointments[0].date : '';
    
    return {
      patientId,
      totalAppointments: patientAppointments.length,
      totalProcesses: patientProcesses.length,
      totalPaid,
      lastVisit,
      reportDate: new Date().toISOString()
    };
  }

  async makePaymentForProcess(patientId: string, processId: string, billingId: string): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Find the billing
    const billingIndex = mockBillings.findIndex(billing => billing.id === billingId);
    
    if (billingIndex === -1) {
      return false;
    }
    
    // Find the process
    const process = mockProcesses.find(p => p.id === processId);
    
    if (!process) {
      return false;
    }
    
    // Find the patient
    const patientIndex = mockPatients.findIndex(pat => pat.id === patientId);
    
    if (patientIndex === -1) {
      return false;
    }
    
    // Check if patient has enough balance
    if (mockPatients[patientIndex].balance < process.price) {
      return false;
    }
    
    // Update the billing status
    const updatedBilling: Billing = {
      ...mockBillings[billingIndex],
      status: 'paid'
    };
    
    mockBillings[billingIndex] = updatedBilling;
    
    // Update patient balance
    mockPatients[patientIndex] = {
      ...mockPatients[patientIndex],
      balance: mockPatients[patientIndex].balance - process.price
    };
    
    return true;
  }
}

export const patientService = new PatientService();
