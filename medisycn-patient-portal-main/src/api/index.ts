import { AuthResponse, PatientProfile, DoctorProfile, Appointment, TimeSlot, User } from '../types';

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
      console.log("getDoctors called with:", { USE_MOCK_DATA, specialization, minRating });
      
      if (USE_MOCK_DATA) {
        // Filter doctors based on criteria
        let doctors = [...MOCK_DOCTORS];
        console.log("Using mock doctors:", doctors);
        
        if (specialization) {
          doctors = doctors.filter(doc => 
            doc.specialization.toLowerCase().includes(specialization.toLowerCase())
          );
        }
        
        if (minRating) {
          doctors = doctors.filter(doc => doc.avgRating >= minRating);
        }
        
        return await mockApiCall(doctors);
      } else {
        // Use real backend API
        let url = `${BASE_URL}/appointments/doctors`;
        const params = new URLSearchParams();
        if (specialization) params.append('specialization', specialization);
        if (minRating) params.append('min_rating', minRating.toString());
        if (params.toString()) url += `?${params.toString()}`;
        
        console.log("Making API call to:", url);
        
        try {
          const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          
          console.log("API response status:", response.status);
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error("API error response:", errorData);
            throw new Error(errorData.detail || 'Failed to get doctors');
          }
          
          const doctors = await response.json();
          console.log("API response data:", doctors);
          
          // Format the response to match our UI needs, handling lowercase property names
          const formattedDoctors = doctors.map((doctor: any) => {
            // Handle property name variations (employeeid vs employeeID vs doctorID)
            const doctorId = doctor.doctorID || doctor.employeeID || doctor.employeeid || null;
            
            console.log("Mapping doctor:", doctor, "ID field:", doctorId);
            
            return {
              doctorID: doctorId, // Use the appropriate ID field
              name: doctor.name || 'Unknown Doctor',
              specialization: doctor.specialization || 'General Practice',
              avgRating: doctor.avgRating || doctor.rating || 0,
              appointmentCount: doctor.appointmentCount || 0,
              experience: `${Math.floor(Math.random() * 10) + 3}+ years`, // Add this to match UI
              fee: doctor.fee || Math.floor(Math.random() * 100) + 100 // Add this to match UI
            };
          });
          
          console.log("Formatted doctors:", formattedDoctors);
          return formattedDoctors;
        } catch (fetchError) {
          console.error("Fetch error:", fetchError);
          // If API call fails, fall back to mock data for development
          console.log("API call failed, falling back to mock data");
          let doctors = [...MOCK_DOCTORS];
          
          if (specialization) {
            doctors = doctors.filter(doc => 
              doc.specialization.toLowerCase().includes(specialization.toLowerCase())
            );
          }
          
          if (minRating) {
            doctors = doctors.filter(doc => doc.avgRating >= minRating);
          }
          
          return doctors;
        }
      }
    } catch (error) {
      console.error('Get doctors error:', error);
      throw error;
    }
  },

  getDoctorAvailableDates: async (doctorId: number): Promise<string[]> => {
    try {
      console.log(`getDoctorAvailableDates called with doctorId: ${doctorId}, type: ${typeof doctorId}`);
      
      // If using mock data, any doctorId is fine (even 0)
      if (USE_MOCK_DATA) {
        console.log("Using mock data for available dates with doctorId:", doctorId);
        // Generate dates for the next 365 days (full year)
        const dates = [];
        for (let i = 1; i <= 365; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);
          
          // Skip weekends (Saturday and Sunday) for some doctors
          if (doctorId % 2 === 0 && (date.getDay() === 0 || date.getDay() === 6)) {
            continue;
          }
          
          dates.push(date.toISOString().split('T')[0]);
        }
        console.log(`Generated ${dates.length} mock dates for doctorId: ${doctorId}`);
        return await mockApiCall(dates);
      } else {
        // Use real backend API
        const url = `${BASE_URL}/appointments/doctor/${doctorId}/available-dates`;
        console.log("Making API call to:", url);
        
        try {
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
        } catch (fetchError) {
          console.error(`Fetch error for doctorId ${doctorId}:`, fetchError);
          
          // For development/testing - fall back to mock data
          console.log("API call failed, falling back to mock dates for doctorId:", doctorId);
          
          // Always use mock data on API error
          const USE_MOCK_FOR_FALLBACK = true;
          
          if (USE_MOCK_FOR_FALLBACK) {
            // Generate dates for testing
            const dates = [];
            for (let i = 1; i <= 365; i++) {
              const date = new Date();
              date.setDate(date.getDate() + i);
              
              // Skip weekends for even doctorIds
              if (doctorId % 2 === 0 && (date.getDay() === 0 || date.getDay() === 6)) {
                continue;
              }
              
              dates.push(date.toISOString().split('T')[0]);
            }
            console.log(`Generated ${dates.length} fallback dates for doctorId: ${doctorId}`);
            return dates;
          } else {
            throw fetchError; // Re-throw if not using fallback
          }
        }
      }
    } catch (error) {
      console.error('Get available dates error:', error);
      throw error;
    }
  },

  getDoctorTimeSlots: async (doctorId: number, date: string): Promise<TimeSlot[]> => {
    try {
      console.log(`getDoctorTimeSlots called with doctorId: ${doctorId}, date: ${date}`);
      
      // If using mock data, any doctorId is fine (even 0)
      if (USE_MOCK_DATA) {
        console.log("Using mock data for time slots with doctorId:", doctorId);
        // Generate time slots for the selected date (30-minute intervals)
        const slots = [];
        const selectedDate = new Date(date);
        
        // Customize working hours based on doctor
        let startHour = 9; // Default start at 9 AM
        let endHour = 17;  // Default end at 5 PM
        
        // Some doctors have different schedules
        if (doctorId % 3 === 0) {
          startHour = 8;  // Start at 8 AM
          endHour = 16;   // End at 4 PM
        } else if (doctorId % 3 === 1) {
          startHour = 10; // Start at 10 AM
          endHour = 18;   // End at 6 PM
        }
        
        // Filter out already booked appointments
        const bookedSlots = MOCK_APPOINTMENTS.filter(apt => 
          apt.doctorID === doctorId && 
          apt.startTime.includes(date) &&
          apt.status !== 'Cancelled'
        ).map(apt => ({
          start: new Date(apt.startTime).getHours() + (new Date(apt.startTime).getMinutes() / 60),
          end: new Date(apt.endTime).getHours() + (new Date(apt.endTime).getMinutes() / 60)
        }));
        
        // Generate 30-minute slots
        for (let hour = startHour; hour < endHour; hour++) {
          for (let minutes = 0; minutes < 60; minutes += 30) {
            selectedDate.setHours(hour, minutes, 0);
            const startTime = new Date(selectedDate);
            
            selectedDate.setMinutes(minutes + 30);
            const endTime = new Date(selectedDate);
            
            // Calculate time as decimal for comparison (e.g., 9.5 for 9:30)
            const slotStartDecimal = hour + (minutes / 60);
            
            // Check if slot is booked or during lunch hour (12-13)
            const isLunchHour = slotStartDecimal >= 12 && slotStartDecimal < 13;
            const isBooked = bookedSlots.some(
              bookedSlot => slotStartDecimal >= bookedSlot.start && slotStartDecimal < bookedSlot.end
            );
            
            // Skip lunch hour and booked slots
            if (!isLunchHour && !isBooked) {
              slots.push({
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString()
              });
            }
          }
        }
        
        console.log(`Generated ${slots.length} mock time slots for doctorId: ${doctorId}`);
        return await mockApiCall(slots);
      } else {
        // Use real backend API
        const url = `${BASE_URL}/appointments/doctor/${doctorId}/slots?date=${date}`;
        console.log("Making API call to:", url);
        
        try {
          const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          
          console.log("API response status:", response.status);
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error("API error response:", errorData);
            throw new Error(errorData.detail || 'Failed to get time slots');
          }
          
          const slots = await response.json();
          console.log(`Received ${slots.length} time slots from API for doctorId: ${doctorId}`);
          return slots;
        } catch (fetchError) {
          console.error(`Fetch error for doctorId ${doctorId}:`, fetchError);
          
          // For development/testing - fall back to mock data
          console.log("API call failed, falling back to mock time slots for doctorId:", doctorId);
          
          // Always use mock data on API error
          const USE_MOCK_FOR_FALLBACK = true;
          
          if (USE_MOCK_FOR_FALLBACK) {
            // Generate fallback time slots
            const slots = [];
            const selectedDate = new Date(date);
            
            // Customize working hours based on doctor ID
            let startHour = 9; 
            let endHour = 17;
            
            // Generate 30-minute slots (skipping lunch hour)
            for (let hour = startHour; hour < endHour; hour++) {
              if (hour === 12) continue; // Skip lunch hour
              
              for (let minutes = 0; minutes < 60; minutes += 30) {
                selectedDate.setHours(hour, minutes, 0);
                const startTime = new Date(selectedDate);
                
                selectedDate.setMinutes(minutes + 30);
                const endTime = new Date(selectedDate);
                
                slots.push({
                  startTime: startTime.toISOString(),
                  endTime: endTime.toISOString()
                });
              }
            }
            
            console.log(`Generated ${slots.length} fallback time slots for doctorId: ${doctorId}`);
            return slots;
          } else {
            throw fetchError; // Re-throw if not using fallback
          }
        }
      }
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

      if (USE_MOCK_DATA) {
        // Create a new appointment
        const newAppointment = {
          appointmentID: Math.floor(Math.random() * 1000) + 1000,
          patientID: 1,
          doctorID: doctorId,
          doctorName: MOCK_DOCTORS.find(d => d.doctorID === doctorId)?.name || '',
          startTime: startTime,
          endTime: endTime,
          status: 'Scheduled' as const
        };
        
        // Add to our mock database
        MOCK_APPOINTMENTS.push(newAppointment);
        
        return await mockApiCall(newAppointment);
      } else {
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
        
        return await response.json();
      }
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
