import axios from "axios";
import {
  mockAuth,
  mockDoctors,
  mockAppointments,
  mockResources,
  mockAdmin,
} from "./mockApi";

const API_URL = "http://localhost:8000/api/v1";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication endpoints
export const auth = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (userData: any) => api.post("/auth/register", userData),
  getCurrentUser: () => api.get("/auth/me"),
};

// Patients endpoints
export const patients = {
  getProfile: () => api.get("/patients/me"),
  updateProfile: (patientData: any) => api.put("/patients/me", patientData),
};

// Doctors endpoints
export const doctors = {
  getAllDoctors: () => api.get("/doctors"),
  getDoctorById: (id: number) => api.get(`/doctors/${id}`),
  getDoctorSlots: (id: number) => api.get(`/doctors/${id}/slots`),
};

// Appointments endpoints
export const appointments = {
  getPatientAppointments: () => api.get("/appointments/patient"),
  createAppointment: (appointmentData: any) =>
    api.post("/appointments", appointmentData),
  updateAppointment: (id: number, data: any) =>
    api.put(`/appointments/${id}`, data),
  deleteAppointment: (id: number) => api.delete(`/appointments/${id}`),
  submitReview: (id: number, reviewData: any) =>
    api.post(`/appointments/${id}/review`, reviewData),
};

// Medical Resources endpoints
export const resources = {
  getAllResources: () => api.get("/resources"),
  requestResource: (resourceData: any) =>
    api.post("/resources/request", resourceData),
};

// Admin endpoints
export const admin = {
  generateReport: (reportData: any) => api.post("/admin/reports", reportData),
  getPatientStatistics: () => api.get("/admin/statistics/patients"),
  getDoctorStatistics: () => api.get("/admin/statistics/doctors"),
  getResourceStatistics: () => api.get("/admin/statistics/resources"),
};

export default api;
