import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DoctorList from "./pages/DoctorList";
import BookAppointment from "./pages/BookAppointment";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AppointmentReview from './pages/patient/AppointmentReview';

// Doctor pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import AppointmentManagement from "./pages/doctor/AppointmentManagement";
import PatientMedicalHistory from './pages/doctor/PatientMedicalHistory';
import DoctorPatients from "./pages/doctor/DoctorPatients";
import Resources from "./pages/doctor/Resources";
import AdminReports from "./pages/admin/AdminReports";
import StaffDashboard from "./pages/staff/StaffDashboard";
import ResourceRequests from "./pages/staff/ResourceRequests";
import Resource from "./pages/staff/Resources";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import DoctorManagement from "./pages/admin/DoctorManagement";
import PatientManagement from "./pages/admin/PatientManagement";


const queryClient = new QueryClient();

// Role-based route protection
const ProtectedRoute = ({ children, allowedRoles = [] }: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) => {
  const userString = localStorage.getItem('user');

  if (!userString) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userString);

    if (!user) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) {
      return <>{children}</>;
    }

    // Redirect to appropriate dashboard based on role
    if (user.role === 'Doctor') {
      return <Navigate to="/doctor/dashboard" replace />;
    } else if (user.role === 'Admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'Staff') {
      return <Navigate to="/staff/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return <Navigate to="/login" replace />;
  }
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Patient routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/doctors" element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <DoctorList />
              </ProtectedRoute>
            } />
            <Route path="/book-appointment/:doctorId" element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <BookAppointment />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/appointments/:appointmentId/review" element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <AppointmentReview />
              </ProtectedRoute>
            } />

            {/* Doctor routes */}
            <Route path="/doctor/dashboard" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/doctor/appointments" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <AppointmentManagement />
              </ProtectedRoute>
            } />
            <Route path="/doctor/patients" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DoctorPatients />
              </ProtectedRoute>
            } />
            <Route path="/doctor/patients/:patientId/history" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <PatientMedicalHistory />
              </ProtectedRoute>
            } />
            <Route path="/doctor/resources" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <Resources />
              </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin/dashboard" element={<Navigate to="/admin/doctors" replace />} />
            <Route path="/admin/doctors" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <DoctorManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/patients" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <PatientManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminReports />
              </ProtectedRoute>
            } />

            {/* Staff routes (placeholder) */}
            <Route path="/staff/dashboard" element={
              <ProtectedRoute allowedRoles={['Staff']}>
                <StaffDashboard />
              </ProtectedRoute>
            } />
            <Route path="/staff/resources" element={
              <ProtectedRoute allowedRoles={['Staff']}>
                <Resource />
              </ProtectedRoute>
            } />
            <Route path="/staff/resource-requests" element={
              <ProtectedRoute allowedRoles={['Staff']}>
                <ResourceRequests />
              </ProtectedRoute>
            } />
            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
