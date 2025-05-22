import { AuthResponse, PatientProfile, DoctorProfile, Appointment, TimeSlot, User, Process } from '../types';

// Set this to false to use real API calls, true for mock data
const USE_MOCK_DATA = false;

// Real API endpoints
const BASE_URL = 'http://localhost:8000/api/v1';

// For development/demo purposes only
// In a real application, we would connect to the actual backend API
const MOCK_DELAY = 500;

// Helper function for simulating API calls
const mockApiCall = <T>(data: T, errorRate = 0): Promise<T> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < errorRate) {
        reject(new Error('API call failed'));
      } else {
        resolve(data);
      }
    }, MOCK_DELAY);
  });
};

// Helper function to convert snake_case/lowercase field names to camelCase
const transformPatientData = (data: any): PatientProfile => {
  return {
    patientID: data.patientid || data.patient_id,
    name: data.name,
    dateOfBirth: data.dob || data.dateofbirth || data.date_of_birth,
    email: data.email,
    phoneNumber: data.phonenumber || data.phone_number,
    balance: data.balance || 0
  };
};

// Helper function to convert appointment fields
const transformAppointmentData = (data: any): Appointment => {
  console.log('Raw appointment data:', data);
  console.log('Raw processes data:', data.processes);
  
  const transformed = {
    appointmentid: data.appointmentid,
  patientid: data.patientid,
  doctorID: data.doctorid,
  doctorName: data.doctorname,
  startTime: data.starttime,
  endTime: data.endtime,
  status: data.status,
  rating: data.rating,
  review: data.review,
  specialization: data.specialization,
  processes: Array.isArray(data.processes)
    ? data.processes.map(process => ({
        processid: process.processid,
        processName: process.processName,
        processDescription: process.processDescription,
        status: process.status,
        doctor_name: process.doctor_name,
        process_date: process.process_date,
        billing: process.billing
      }))
    : []
};
  
  console.log('Transformed appointment:', transformed);
  return transformed;
};

// Helper function to convert doctor fields
const transformDoctorData = (data: any): DoctorProfile => {
  return {
    doctorID: data.doctorid || data.doctor_id || data.employeeid || data.employee_id,
    name: data.name,
    specialization: data.specialization,
    avgRating: data.avgrating || data.avg_rating || data.rating || 0,
    appointmentCount: data.appointmentcount || data.appointment_count || 0,
    experience: data.experience || 'N/A',
    fee: data.fee || 0,
    profileImage: data.profileimage || data.profile_image
  };
};

// Helper function to convert time slot fields
const transformTimeSlotData = (data: any): TimeSlot => {
  return {
    startTime: data.starttime || data.start_time,
    endTime: data.endtime || data.end_time
  };
};

// Authentication API
export const authApi = {
  register: async (userData: any): Promise<User> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await fetch(`${BASE_URL}/auth/token`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
};

// Patient API
export const patientApi = {
  getProfile: async (): Promise<PatientProfile> => {
    try {
      const response = await fetch(`${BASE_URL}/patients/profile`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      return transformPatientData(data);
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  updateProfile: async (profileData: Partial<PatientProfile>): Promise<PatientProfile> => {
    try {
      const response = await fetch(`${BASE_URL}/patients/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const data = await response.json();
      return transformPatientData(data);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  addFunds: async (amount: number): Promise<PatientProfile> => {
    try {
      const response = await fetch(`${BASE_URL}/patients/balance/add?amount=${amount}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to add funds');
      }
      
      const data = await response.json();
      return transformPatientData(data);
    } catch (error) {
      console.error('Add funds error:', error);
      throw error;
    }
  },

  getAppointments: async (status?: string): Promise<Appointment[]> => {
    try {
      if (USE_MOCK_DATA) {
        return await mockApiCall([
          {
            appointmentID: 1,
            patientID: 1,
            doctorID: 101,
            doctorName: 'Dr. Sarah Johnson',
            startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
            status: 'scheduled' as const
          },
          {
            appointmentID: 2,
            patientID: 1,
            doctorID: 102,
            doctorName: 'Dr. Mark Williams',
            startTime: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            endTime: new Date(Date.now() - 172800000 + 3600000).toISOString(),
            status: 'completed' as const,
            rating: 5,
            review: 'Excellent doctor, very professional!'
          }
        ]);
      }
      
      // Try real API call, but the response validation might fail
      try {
        let url = `${BASE_URL}/appointments/patient`;
        if (status) url += `?status=${status}`;
        
        console.log('Fetching appointments from:', url);
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }
        
        const data = await response.json();
        console.log('Raw API response:', data);
        
        const transformedData = Array.isArray(data) ? data.map(transformAppointmentData) : [];
        console.log('Transformed appointments:', transformedData);
        return transformedData;
      } catch (apiError) {
        console.error('API error, falling back to mock data:', apiError);
        
        // Fall back to mock data if the API call fails
        return [
          {
            appointmentID: 1,
            patientID: 1,
            doctorID: 101,
            doctorName: 'Dr. Sarah Johnson',
            startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
            status: 'scheduled' as const
          },
          {
            appointmentID: 2,
            patientID: 1,
            doctorID: 102,
            doctorName: 'Dr. Mark Williams',
            startTime: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            endTime: new Date(Date.now() - 172800000 + 3600000).toISOString(),
            status: 'completed' as const,
            rating: 5,
            review: 'Excellent doctor, very professional!'
          }
        ];
      }
    } catch (error) {
      console.error('Get appointments error:', error);
      throw error;
    }
  },

  reviewAppointment: async (appointmentId: number, rating: number, review: string) => {
    const response = await fetch(`${BASE_URL}/appointments/${appointmentId}/review`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rating, review })
    });
    return response.ok;
  }
};

// Realistic doctor data with specialties matching the screenshot
const MOCK_DOCTORS = [
        {
          doctorID: 101,
    name: 'Dr. Emma Smith',
          specialization: 'Cardiology',
    experience: '8+ years',
    fee: 150,
          avgRating: 4.8,
    appointmentCount: 253,
    profileImage: '/doctors/emma-smith.jpg'
        },
        {
          doctorID: 102,
    name: 'Dr. James Wilson',
          specialization: 'Neurology',
    experience: '12+ years',
    fee: 180,
          avgRating: 4.9,
    appointmentCount: 187,
    profileImage: '/doctors/james-wilson.jpg'
        },
        {
          doctorID: 103,
          name: 'Dr. Emily Chen',
          specialization: 'Pediatrics',
    experience: '6+ years',
    fee: 120,
          avgRating: 4.7,
    appointmentCount: 312,
    profileImage: '/doctors/emily-chen.jpg'
        },
        {
          doctorID: 104,
          name: 'Dr. Michael Brown',
          specialization: 'Orthopedics',
    experience: '15+ years',
    fee: 200,
          avgRating: 4.6,
    appointmentCount: 205,
    profileImage: '/doctors/michael-brown.jpg'
        },
        {
          doctorID: 105,
    name: 'Dr. Anna Lee',
          specialization: 'Dermatology',
    experience: '9+ years',
    fee: 160,
          avgRating: 4.8,
    appointmentCount: 178,
    profileImage: '/doctors/anna-lee.jpg'
        }
];

// Mock appointment database to track booked slots
let MOCK_APPOINTMENTS = [
  // Initial appointment data if needed
];

// Appointment API
export const appointmentApi = {
  getDoctors: async (specialization?: string, minRating?: number): Promise<DoctorProfile[]> => {
    try {
      console.log("getDoctors called with:", { specialization, minRating });
      
      // Use real backend API
      let url = `${BASE_URL}/appointments/doctors`;
      const params = new URLSearchParams();
      if (specialization) params.append('specialization', specialization);
      if (minRating) params.append('min_rating', minRating.toString());
      if (params.toString()) url += `?${params.toString()}`;
      
      console.log("Making API call to:", url);
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      console.log("API response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error(errorData.detail || 'Failed to get doctors');
      }
      
      const data = await response.json();
      console.log("API response data:", data);
      
      // Transform the doctors data
      const doctors = Array.isArray(data) ? data.map(transformDoctorData) : [];
      console.log("Transformed doctors:", doctors);
      return doctors;
    } catch (error) {
      console.error('Get doctors error:', error);
      throw error;
    }
  },

  getDoctorAvailableDates: async (doctorId: number): Promise<string[]> => {
    try {
      console.log(`getDoctorAvailableDates called with doctorId: ${doctorId}, type: ${typeof doctorId}`);
      
      // Use real backend API
      const url = `${BASE_URL}/appointments/doctor/${doctorId}/available-dates`;
      console.log("Making API call to:", url);
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      console.log("API response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error(errorData.detail || 'Failed to get available dates');
      }
      
      const dates = await response.json();
      console.log(`Received ${dates.length} dates from API for doctorId: ${doctorId}`);
      return dates;
    } catch (error) {
      console.error(`Fetch error for doctorId ${doctorId}:`, error);
      throw error;
    }
  },

  getDoctorTimeSlots: async (doctorId: number, date: string): Promise<TimeSlot[]> => {
    try {
      console.log(`getDoctorTimeSlots called with doctorId: ${doctorId}, date: ${date}`);
      
      // Use real backend API
      const url = `${BASE_URL}/appointments/doctor/${doctorId}/slots?date=${date}`;
      console.log("Making API call to:", url);
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      console.log("API response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error(errorData.detail || 'Failed to get time slots');
      }
      
      const data = await response.json();
      console.log(`Received ${data.length} time slots from API for doctorId: ${doctorId}`);
      
      // Transform the time slots data
      const slots = Array.isArray(data) ? data.map(transformTimeSlotData) : [];
      return slots;
    } catch (error) {
      console.error('Get time slots error:', error);
      throw error;
    }
  },

  bookAppointment: async (doctorId: number, startTime: string, endTime: string): Promise<Appointment> => {
    try {
      console.log(`bookAppointment called with doctorId: ${doctorId}`);
      
      // Validate doctorId
      if (isNaN(doctorId)) {
        console.error("Invalid doctorId for booking:", doctorId);
        throw new Error("Invalid doctor ID");
      }

      // Use real backend API
      const response = await fetch(`${BASE_URL}/appointments/book`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ doctorID: doctorId, startTime, endTime })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to book appointment');
      }
      
      const data = await response.json();
      return transformAppointmentData(data);
    } catch (error) {
      console.error('Book appointment error:', error);
      throw error;
    }
  },

  // Generate available slots for a year (utility function to help with initialization)
  generateYearlySlots: async (doctorId: number): Promise<void> => {
    try {
      // This would be a backend script, not exposed to the frontend in a real app
      console.log(`Generating yearly slots for doctor ${doctorId}`);
      
      // In a real implementation, this would create database entries
      return await mockApiCall(undefined);
    } catch (error) {
      console.error('Generate yearly slots error:', error);
      throw error;
    }
  },

  addReview: async (appointmentId: number, rating: number, review?: string): Promise<Appointment> => {
    try {
      const response = await fetch(`${BASE_URL}/appointments/${appointmentId}/review`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating, review })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add review');
      }
      
      const data = await response.json();
      return transformAppointmentData(data);
    } catch (error) {
      console.error('Add review error:', error);
      throw error;
    }
  },

  updateAppointmentStatus: async (appointmentId: number, status: 'scheduled' | 'completed' | 'cancelled'): Promise<Appointment> => {
    try {
      console.log(`API: Updating appointment ${appointmentId} to status ${status}`);
      
      const response = await fetch(`${BASE_URL}/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      console.log(`API: Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
          console.error('API error response:', errorData);
        } catch (e) {
          console.error('API error response (not JSON):', errorText);
        }
        throw new Error(errorData?.detail || `Failed to update appointment status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API: Update successful, returned data:', data);
      return transformAppointmentData(data);
    } catch (error) {
      console.error('Update appointment status error:', error);
      throw error;
    }
  }
};

// Doctor API
export const doctorApi = {
  getProfile: async (): Promise<DoctorProfile> => {
    try {
      return await mockApiCall({
        doctorID: 101,
        name: 'Dr. Sarah Johnson',
        specialization: 'Cardiology',
        avgRating: 4.8,
        appointmentCount: 253
      });
    } catch (error) {
      console.error('Get doctor profile error:', error);
      throw error;
    }
  },

  getAppointments: async (status?: string, upcoming?: boolean): Promise<Appointment[]> => {
    try {
      // Try to use real API call first
      try {
        console.log("Fetching doctor appointments from API");
        let url = `${BASE_URL}/appointments/doctor`;
        if (status) url += `?status=${status}`;
        
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        console.log("Doctor appointments API response status:", response.status);
        
        if (!response.ok) {
          throw new Error('Failed to fetch doctor appointments');
        }
        
        const data = await response.json();
        console.log("Received doctor appointments from API:", data);
        
        // Transform the data to match frontend format
        const appointments = Array.isArray(data) ? data.map(transformAppointmentData) : [];
        console.log("Transformed doctor appointments:", appointments);
        return appointments;
      } catch (apiError) {
        console.error('API error, falling back to mock data:', apiError);
        // Fall back to mock data if API call fails
        return mockApiCall([
          {
            appointmentID: 1,
            patientID: 1,
            doctorID: 101,
            startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
            status: 'scheduled' as const
          },
          {
            appointmentID: 2,
            patientID: 2,
            doctorID: 101,
            startTime: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            endTime: new Date(Date.now() - 172800000 + 3600000).toISOString(),
            status: 'completed' as const
          }
        ]);
      }
    } catch (error) {
      console.error('Get doctor appointments error:', error);
      throw error;
    }
  },

  updateAppointmentStatus: async (appointmentId: number, status: 'scheduled' | 'completed' | 'cancelled'): Promise<Appointment> => {
    try {
      console.log(`API: Updating appointment ${appointmentId} to status ${status}`);
      
      const response = await fetch(`${BASE_URL}/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      console.log(`API: Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
          console.error('API error response:', errorData);
        } catch (e) {
          console.error('API error response (not JSON):', errorText);
        }
        throw new Error(errorData?.detail || `Failed to update appointment status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API: Update successful, returned data:', data);
      return transformAppointmentData(data);
    } catch (error) {
      console.error('Update appointment status error:', error);
      throw error;
    }
  },

  getPatients: async (): Promise<PatientProfile[]> => {
    try {
      const response = await fetch(`${BASE_URL}/doctors/patients`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch doctor patients');
      }
      const data = await response.json();
      // Transform each patient to match PatientProfile
      return Array.isArray(data) ? data.map(transformPatientData) : [];
    } catch (error) {
      console.error('Get patients error:', error);
      throw error;
    }
  },

  getPatientMedicalHistory: async (patientId: number): Promise<{
    patient: PatientProfile | null;
    appointments: Appointment[];
    processes: Process[];
  }> => {
    try {
      // Fetch all patients for this doctor
      const patientsRes = await fetch(`${BASE_URL}/doctors/patients`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const allPatients = await patientsRes.json();
      const patient = allPatients.find((p: any) => p.patientID === patientId || p.patientid === patientId) || null;

      // Fetch appointments for the current doctor
      const appointmentsRes = await fetch(`${BASE_URL}/appointments/doctor`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const allAppointments = await appointmentsRes.json();
      const appointments = allAppointments.filter((app: any) => app.patientid === patientId);

      // Fetch processes
      const processesRes = await fetch(`${BASE_URL}/processes/doctor/patient/${patientId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const processes = await processesRes.json();

      console.log('Final data:', {
        patient,
        appointments,
        processes
      });

      return { 
        patient,
        appointments, 
        processes 
      };
    } catch (error) {
      console.error('Get patient medical history error:', error);
      throw error;
    }
  }
};

// Admin API
export const adminApi = {
  getDoctors: async (): Promise<DoctorProfile[]> => {
    try {
      const response = await fetch(`${BASE_URL}/admin/doctors`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch doctors');
      }
      
      const data = await response.json();
      return data.map((doctor: any) => ({
        doctorid: doctor.employeeid,
        name: doctor.name,
        specialization: doctor.specialization,
        rating: doctor.rating || 0,
        appointmentCount: doctor.appointmentcount || 0,
        experience: doctor.experience || 'N/A',
        fee: doctor.fee || 0
      }));
    } catch (error) {
      console.error('Get all doctors error:', error);
      throw error;
    }
  },

  getPatients: async (): Promise<PatientProfile[]> => {
    try {
      const response = await fetch(`${BASE_URL}/admin/patients`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }
      
      const data = await response.json();
      return data.map((patient: any) => ({
        patientid: patient.patientid,
        name: patient.name,
        dob: patient.dob,
        email: patient.email,
        phonenumber: patient.phonenumber,
        balance: patient.balance || 0
      }));
    } catch (error) {
      console.error('Get all patients error:', error);
      throw error;
    }
  },

  getAppointmentStats: async (period: 'week' | 'month' | 'quarter' | 'year'): Promise<AppointmentStats> => {
    try {
      console.log('Fetching appointment stats for period:', period);
      const response = await fetch(`${BASE_URL}/admin/stats/appointments?period=${period}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointment statistics');
      }
      
      const data = await response.json();
      console.log('Raw appointment stats response:', data);
      
      const stats = {
        totalappointments: data.totalappointments || 0,
        scheduledappointments: data.scheduledappointments || 0,
        completedappointments: data.completedappointments || 0,
        cancelledappointments: data.cancelledappointments || 0,
        period: data.period,
        startdate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        enddate: data.endDate ? new Date(data.endDate).toISOString() : undefined
      };
      
      console.log('Processed appointment stats:', stats);
      return stats;
    } catch (error) {
      console.error('Get appointment stats error:', error);
      throw error;
    }
  },

  getRevenueStats: async (period: 'week' | 'month' | 'quarter' | 'year'): Promise<RevenueStats> => {
    try {
      const response = await fetch(`${BASE_URL}/admin/stats/revenue?period=${period}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch revenue statistics');
      }
      
      const data = await response.json();
      return {
        totalrevenue: data.totalrevenue || 0,
        billingcount: data.billingcount || 0,
        avgbillingamount: data.avgbillingamount || 0,
        period: data.period,
        startdate: data.startdate,
        enddate: data.enddate
      };
    } catch (error) {
      console.error('Get revenue stats error:', error);
      throw error;
    }
  }
};
