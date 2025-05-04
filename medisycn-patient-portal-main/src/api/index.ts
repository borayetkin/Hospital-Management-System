import { AuthResponse, PatientProfile, DoctorProfile, Appointment, TimeSlot, User } from '../types';

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
      // return await fetch(`${BASE_URL}/patients/profile`, {
      //   headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      // }).then(res => res.json());
      
      return await mockApiCall({
        patientID: 1,
        name: 'John Doe',
        dateOfBirth: '1990-01-01',
        email: 'john.doe@example.com',
        phoneNumber: '123-456-7890',
        balance: 500.00
      });
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  updateProfile: async (profileData: Partial<PatientProfile>): Promise<PatientProfile> => {
    try {
      // return await fetch(`${BASE_URL}/patients/profile`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(profileData)
      // }).then(res => res.json());
      
      return await mockApiCall({
        patientID: 1,
        name: profileData.name || 'John Doe',
        dateOfBirth: '1990-01-01',
        email: profileData.email || 'john.doe@example.com',
        phoneNumber: profileData.phoneNumber || '123-456-7890',
        balance: 500.00
      });
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  addFunds: async (amount: number): Promise<PatientProfile> => {
    try {
      // return await fetch(`${BASE_URL}/patients/balance/add`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ amount })
      // }).then(res => res.json());
      
      return await mockApiCall({
        patientID: 1,
        name: 'John Doe',
        dateOfBirth: '1990-01-01',
        email: 'john.doe@example.com',
        phoneNumber: '123-456-7890',
        balance: 500.00 + amount
      });
    } catch (error) {
      console.error('Add funds error:', error);
      throw error;
    }
  },

  getAppointments: async (status?: string): Promise<Appointment[]> => {
    try {
      // let url = `${BASE_URL}/appointments/patient`;
      // if (status) url += `?status=${status}`;
      // return await fetch(url, {
      //   headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      // }).then(res => res.json());
      
      return await mockApiCall([
        {
          appointmentID: 1,
          patientID: 1,
          doctorID: 101,
          doctorName: 'Dr. Sarah Johnson',
          startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
          status: 'Scheduled' as const
        },
        {
          appointmentID: 2,
          patientID: 1,
          doctorID: 102,
          doctorName: 'Dr. Mark Williams',
          startTime: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          endTime: new Date(Date.now() - 172800000 + 3600000).toISOString(),
          status: 'Completed' as const,
          rating: 5,
          review: 'Excellent doctor, very professional!'
        }
      ]);
    } catch (error) {
      console.error('Get appointments error:', error);
      throw error;
    }
  }
};

// Appointment API
export const appointmentApi = {
  getDoctors: async (specialization?: string, minRating?: number): Promise<DoctorProfile[]> => {
    try {
      // let url = `${BASE_URL}/appointments/doctors`;
      // const params = new URLSearchParams();
      // if (specialization) params.append('specialization', specialization);
      // if (minRating) params.append('min_rating', minRating.toString());
      // if (params.toString()) url += `?${params.toString()}`;
      // return await fetch(url, {
      //   headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      // }).then(res => res.json());
      
      return await mockApiCall([
        {
          doctorID: 101,
          name: 'Dr. Sarah Johnson',
          specialization: 'Cardiology',
          avgRating: 4.8,
          appointmentCount: 253
        },
        {
          doctorID: 102,
          name: 'Dr. Mark Williams',
          specialization: 'Neurology',
          avgRating: 4.9,
          appointmentCount: 187
        },
        {
          doctorID: 103,
          name: 'Dr. Emily Chen',
          specialization: 'Pediatrics',
          avgRating: 4.7,
          appointmentCount: 312
        },
        {
          doctorID: 104,
          name: 'Dr. Michael Brown',
          specialization: 'Orthopedics',
          avgRating: 4.6,
          appointmentCount: 205
        },
        {
          doctorID: 105,
          name: 'Dr. Anna Smith',
          specialization: 'Dermatology',
          avgRating: 4.8,
          appointmentCount: 178
        }
      ]);
    } catch (error) {
      console.error('Get doctors error:', error);
      throw error;
    }
  },

  getDoctorAvailableDates: async (doctorId: number): Promise<string[]> => {
    try {
      // return await fetch(`${BASE_URL}/appointments/doctor/${doctorId}/available-dates`, {
      //   headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      // }).then(res => res.json());
      
      // Generate dates for the next 7 days
      const dates = [];
      for (let i = 1; i <= 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }
      return await mockApiCall(dates);
    } catch (error) {
      console.error('Get available dates error:', error);
      throw error;
    }
  },

  getDoctorTimeSlots: async (doctorId: number, date: string): Promise<TimeSlot[]> => {
    try {
      // return await fetch(`${BASE_URL}/appointments/doctor/${doctorId}/slots?date=${date}`, {
      //   headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      // }).then(res => res.json());
      
      // Generate time slots for the selected date (9 AM to 5 PM)
      const slots = [];
      const selectedDate = new Date(date);
      for (let hour = 9; hour < 17; hour++) {
        selectedDate.setHours(hour, 0, 0);
        const startTime = new Date(selectedDate);
        
        selectedDate.setHours(hour + 1, 0, 0);
        const endTime = new Date(selectedDate);
        
        // Skip some slots to simulate unavailability
        if (hour !== 12 && hour !== 15) { // Skip lunch hour and 3 PM
          slots.push({
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString()
          });
        }
      }
      return await mockApiCall(slots);
    } catch (error) {
      console.error('Get time slots error:', error);
      throw error;
    }
  },

  bookAppointment: async (doctorId: number, startTime: string, endTime: string): Promise<Appointment> => {
    try {
      // return await fetch(`${BASE_URL}/appointments/book`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ doctorID: doctorId, startTime, endTime })
      // }).then(res => res.json());
      
      return await mockApiCall({
        appointmentID: Math.floor(Math.random() * 1000),
        patientID: 1,
        doctorID: doctorId,
        startTime: startTime,
        endTime: endTime,
        status: 'Scheduled' as const
      });
    } catch (error) {
      console.error('Book appointment error:', error);
      throw error;
    }
  },

  addReview: async (appointmentId: number, rating: number, review?: string): Promise<Appointment> => {
    try {
      // return await fetch(`${BASE_URL}/appointments/${appointmentId}/review`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ rating, review })
      // }).then(res => res.json());
      
      return await mockApiCall({
        appointmentID: appointmentId,
        patientID: 1,
        doctorID: 101,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        status: 'Completed' as const,
        rating: rating,
        review: review
      });
    } catch (error) {
      console.error('Add review error:', error);
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
      return await mockApiCall([
        {
          appointmentID: 1,
          patientID: 1,
          doctorID: 101,
          startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
          status: 'Scheduled' as const
        },
        {
          appointmentID: 2,
          patientID: 2,
          doctorID: 101,
          startTime: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          endTime: new Date(Date.now() - 172800000 + 3600000).toISOString(),
          status: 'Completed' as const
        }
      ]);
    } catch (error) {
      console.error('Get doctor appointments error:', error);
      throw error;
    }
  },

  updateAppointmentStatus: async (appointmentId: number, status: 'Scheduled' | 'Completed' | 'Cancelled'): Promise<Appointment> => {
    try {
      return await mockApiCall({
        appointmentID: appointmentId,
        patientID: 1,
        doctorID: 101,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        status: status
      });
    } catch (error) {
      console.error('Update appointment status error:', error);
      throw error;
    }
  },

  getPatients: async (): Promise<PatientProfile[]> => {
    try {
      return await mockApiCall([
        {
          patientID: 1,
          name: 'John Doe',
          dateOfBirth: '1990-01-01',
          email: 'john.doe@example.com',
          phoneNumber: '123-456-7890',
          balance: 500
        },
        {
          patientID: 2,
          name: 'Jane Smith',
          dateOfBirth: '1985-05-15',
          email: 'jane.smith@example.com',
          phoneNumber: '234-567-8901',
          balance: 350
        }
      ]);
    } catch (error) {
      console.error('Get patients error:', error);
      throw error;
    }
  }
};

// Admin API
export const adminApi = {
  getDoctors: async (): Promise<DoctorProfile[]> => {
    try {
      return await mockApiCall([
        {
          doctorID: 101,
          name: 'Dr. Sarah Johnson',
          specialization: 'Cardiology',
          avgRating: 4.8,
          appointmentCount: 253
        },
        {
          doctorID: 102,
          name: 'Dr. Mark Williams',
          specialization: 'Neurology',
          avgRating: 4.9,
          appointmentCount: 187
        },
        {
          doctorID: 103,
          name: 'Dr. Emily Chen',
          specialization: 'Pediatrics',
          avgRating: 4.7,
          appointmentCount: 312
        }
      ]);
    } catch (error) {
      console.error('Get all doctors error:', error);
      throw error;
    }
  },

  getPatients: async (): Promise<PatientProfile[]> => {
    try {
      return await mockApiCall([
        {
          patientID: 1,
          name: 'John Doe',
          dateOfBirth: '1990-01-01',
          email: 'john.doe@example.com',
          phoneNumber: '123-456-7890',
          balance: 500
        },
        {
          patientID: 2,
          name: 'Jane Smith',
          dateOfBirth: '1985-05-15',
          email: 'jane.smith@example.com',
          phoneNumber: '234-567-8901',
          balance: 350
        },
        {
          patientID: 3,
          name: 'Michael Brown',
          dateOfBirth: '1978-08-22',
          email: 'michael.brown@example.com',
          phoneNumber: '345-678-9012',
          balance: 200
        }
      ]);
    } catch (error) {
      console.error('Get all patients error:', error);
      throw error;
    }
  },

  getAppointmentStats: async (period: 'week' | 'month' | 'quarter' | 'year'): Promise<any> => {
    try {
      return await mockApiCall({
        totalAppointments: 325,
        scheduledAppointments: 145,
        completedAppointments: 164,
        cancelledAppointments: 16,
        period: period,
        startDate: '2023-01-01',
        endDate: '2023-12-31'
      });
    } catch (error) {
      console.error('Get appointment stats error:', error);
      throw error;
    }
  },

  getRevenueStats: async (period: 'week' | 'month' | 'quarter' | 'year'): Promise<any> => {
    try {
      return await mockApiCall({
        totalRevenue: 87500,
        billingCount: 164,
        avgBillingAmount: 533.54,
        period: period,
        startDate: '2023-01-01',
        endDate: '2023-12-31'
      });
    } catch (error) {
      console.error('Get revenue stats error:', error);
      throw error;
    }
  }
};
