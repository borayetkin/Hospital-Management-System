// This file provides mock API responses for development
// It simulates backend responses while developing the frontend

// Mock user data
const users = [
  {
    userID: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    role: "patient",
  },
  {
    userID: 2,
    name: "Dr. Jane Smith",
    email: "jane.smith@example.com",
    role: "doctor",
  },
  {
    userID: 3,
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
  },
];

// Mock doctor data
const doctorList = [
  {
    employeeID: 101,
    name: "Jane Smith",
    specialization: "Cardiology",
    doctorLocation: "Building A, Floor 3",
    deptName: "Cardiology",
    rating: 4.8,
  },
  {
    employeeID: 102,
    name: "Robert Johnson",
    specialization: "Neurology",
    doctorLocation: "Building B, Floor 2",
    deptName: "Neurology",
    rating: 4.5,
  },
  {
    employeeID: 103,
    name: "Sarah Lee",
    specialization: "Pediatrics",
    doctorLocation: "Building C, Floor 1",
    deptName: "Pediatrics",
    rating: 4.9,
  },
  {
    employeeID: 104,
    name: "Michael Chen",
    specialization: "Orthopedics",
    doctorLocation: "Building A, Floor 2",
    deptName: "Orthopedics",
    rating: 4.6,
  },
  {
    employeeID: 105,
    name: "Lisa Brown",
    specialization: "Dermatology",
    doctorLocation: "Building D, Floor 1",
    deptName: "Dermatology",
    rating: 4.7,
  },
  {
    employeeID: 106,
    name: "David Wilson",
    specialization: "Ophthalmology",
    doctorLocation: "Building B, Floor 3",
    deptName: "Ophthalmology",
    rating: 4.4,
  },
];

// Mock appointment slots
const doctorSlots = {
  101: [
    {
      startTime: "2023-06-12T09:00:00",
      endTime: "2023-06-12T09:30:00",
      availability: "available",
    },
    {
      startTime: "2023-06-12T10:00:00",
      endTime: "2023-06-12T10:30:00",
      availability: "available",
    },
    {
      startTime: "2023-06-12T11:00:00",
      endTime: "2023-06-12T11:30:00",
      availability: "booked",
    },
    {
      startTime: "2023-06-13T09:00:00",
      endTime: "2023-06-13T09:30:00",
      availability: "available",
    },
    {
      startTime: "2023-06-13T10:00:00",
      endTime: "2023-06-13T10:30:00",
      availability: "available",
    },
  ],
  102: [
    {
      startTime: "2023-06-12T14:00:00",
      endTime: "2023-06-12T14:30:00",
      availability: "available",
    },
    {
      startTime: "2023-06-12T15:00:00",
      endTime: "2023-06-12T15:30:00",
      availability: "booked",
    },
    {
      startTime: "2023-06-13T14:00:00",
      endTime: "2023-06-13T14:30:00",
      availability: "available",
    },
  ],
};

// Mock patient appointments
const patientAppointments = [
  {
    appointmentID: 201,
    status: "completed",
    rating: 5,
    review: "Great experience, very helpful doctor.",
    patientID: 1,
    doctorID: 101,
    doctorName: "Jane Smith",
    startTime: "2023-05-20T10:00:00",
    endTime: "2023-05-20T10:30:00",
  },
  {
    appointmentID: 202,
    status: "upcoming",
    patientID: 1,
    doctorID: 102,
    doctorName: "Robert Johnson",
    startTime: "2023-06-15T14:00:00",
    endTime: "2023-06-15T14:30:00",
  },
];

// Mock medical resources
const medicalResources = [
  {
    resourceID: 301,
    name: "MRI Machine",
    availability: "available",
  },
  {
    resourceID: 302,
    name: "X-Ray Equipment",
    availability: "available",
  },
  {
    resourceID: 303,
    name: "Blood Test Kit",
    availability: "unavailable",
  },
  {
    resourceID: 304,
    name: "Surgery Room A",
    availability: "available",
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock API functions
export const mockAuth = {
  login: async (email: string, password: string) => {
    await delay(500);
    const user = users.find((u) => u.email === email);

    if (user && password === "password") {
      return {
        data: {
          access_token: "mock_token_" + user.role,
          user,
        },
      };
    }

    throw { response: { data: { detail: "Invalid credentials" } } };
  },
  register: async (userData: any) => {
    await delay(800);
    return { data: { message: "User registered successfully" } };
  },
  getCurrentUser: async () => {
    await delay(300);
    // Determine user type from token
    const token = localStorage.getItem("token");
    let userRole = "patient";

    if (token) {
      if (token.includes("doctor")) userRole = "doctor";
      if (token.includes("admin")) userRole = "admin";
    }

    const user = users.find((u) => u.role === userRole);
    return { data: user };
  },
};

export const mockDoctors = {
  getAllDoctors: async () => {
    await delay(700);
    return { data: doctorList };
  },
  getDoctorById: async (id: number) => {
    await delay(500);
    const doctor = doctorList.find((d) => d.employeeID === id);

    if (doctor) {
      return { data: doctor };
    }

    throw { response: { data: { detail: "Doctor not found" } } };
  },
  getDoctorSlots: async (id: number) => {
    await delay(600);
    const slots = doctorSlots[id as keyof typeof doctorSlots] || [];
    return { data: slots };
  },
};

export const mockAppointments = {
  getPatientAppointments: async () => {
    await delay(800);
    return { data: patientAppointments };
  },
  createAppointment: async (appointmentData: any) => {
    await delay(1000);
    const newAppointment = {
      appointmentID: Math.floor(Math.random() * 1000) + 500,
      status: "upcoming",
      ...appointmentData,
      doctorName: doctorList.find(
        (d) => d.employeeID === appointmentData.doctorID
      )?.name,
    };

    return { data: newAppointment };
  },
  updateAppointment: async (id: number, data: any) => {
    await delay(700);
    return { data: { ...data, appointmentID: id } };
  },
  deleteAppointment: async (id: number) => {
    await delay(500);
    return { data: { message: "Appointment deleted successfully" } };
  },
  submitReview: async (id: number, reviewData: any) => {
    await delay(600);
    return { data: { appointmentID: id, ...reviewData } };
  },
};

export const mockResources = {
  getAllResources: async () => {
    await delay(700);
    return { data: medicalResources };
  },
  requestResource: async (resourceData: any) => {
    await delay(900);
    return {
      data: { message: "Resource requested successfully", ...resourceData },
    };
  },
};

export const mockAdmin = {
  generateReport: async (reportData: any) => {
    await delay(1500);
    return {
      data: { reportID: Math.floor(Math.random() * 1000), ...reportData },
    };
  },
  getPatientStatistics: async () => {
    await delay(1200);
    return {
      data: [
        { patientID: 1, totalAppointments: 5, totalPaid: 500 },
        { patientID: 4, totalAppointments: 3, totalPaid: 300 },
        { patientID: 7, totalAppointments: 8, totalPaid: 800 },
      ],
    };
  },
  getDoctorStatistics: async () => {
    await delay(1200);
    return {
      data: [
        {
          doctorID: 101,
          appointmentCount: 25,
          totalRevenue: 2500,
          ratings: 4.8,
        },
        {
          doctorID: 102,
          appointmentCount: 18,
          totalRevenue: 1800,
          ratings: 4.5,
        },
        {
          doctorID: 103,
          appointmentCount: 30,
          totalRevenue: 3000,
          ratings: 4.9,
        },
      ],
    };
  },
  getResourceStatistics: async () => {
    await delay(1200);
    return {
      data: [
        { resourceID: 301, usageCount: 45, totalRequests: 50 },
        { resourceID: 302, usageCount: 38, totalRequests: 40 },
        { resourceID: 303, usageCount: 12, totalRequests: 15 },
      ],
    };
  },
};
