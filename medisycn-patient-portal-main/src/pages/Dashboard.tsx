import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { patientApi } from '@/api';
import { Appointment, PatientProfile } from '@/types';
import Navbar from '@/components/Navbar';
import AppointmentCard from '@/components/AppointmentCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Search, Plus, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Fetch patient profile and appointments
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [profileData, appointmentsData] = await Promise.all([
          patientApi.getProfile(),
          patientApi.getAppointments()
        ]);
        
        setProfile(profileData);
        setAppointments(appointmentsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load your dashboard data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, navigate, toast]);

  const handleReviewAppointment = (appointmentId: number) => {
    // Redirect to review page or open modal
    navigate(`/appointments/${appointmentId}/review`);
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    // Show confirmation and cancel appointment
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        // Call the API to cancel the appointment
        const response = await fetch(`http://localhost:8000/api/v1/appointments/${appointmentId}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'cancelled' })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to cancel appointment');
        }
        
        toast({
          title: "Appointment Cancelled",
          description: "Your appointment has been cancelled successfully",
        });
        
        // Update appointments list locally
        setAppointments(appointments.map(appointment => 
          appointment.appointmentid === appointmentId 
            ? { ...appointment, status: 'cancelled' as const } 
            : appointment
        ));
        
        // Refresh appointment data from server
        try {
          const data = await patientApi.getAppointments();
          setAppointments(data);
        } catch (refreshError) {
          console.error('Error refreshing appointments:', refreshError);
        }
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        toast({
          title: "Error",
          description: "Failed to cancel your appointment",
          variant: "destructive"
        });
      }
    }
  };

  const handlePayment = async (processId: number, amount: number) => {
    try {
      // Call the API to process the payment
      const response = await fetch(`http://localhost:8000/api/v1/processes/${processId}/pay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process payment');
      }
      
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully",
      });
      
      // Refresh both appointments and profile data
      try {
        const [appointmentsData, profileData] = await Promise.all([
          patientApi.getAppointments(),
          patientApi.getProfile()
        ]);
        setAppointments(appointmentsData);
        setProfile(profileData);
      } catch (refreshError) {
        console.error('Error refreshing data:', refreshError);
        toast({
          title: "Warning",
          description: "Payment successful but failed to refresh data. Please refresh the page.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Failed to process your payment",
        variant: "destructive"
      });
    }
  };

  // Split appointments into upcoming and past
  const upcomingAppointments = appointments.filter(
    appointment => appointment.status.toLowerCase() === 'scheduled'
  );
  
  const pastAppointments = appointments.filter(
    appointment => appointment.status.toLowerCase() === 'completed' || appointment.status.toLowerCase() === 'cancelled'
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-1/4 mt-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        {profile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Quick Actions */}
            <Card className="p-6 bg-gradient-to-br from-medisync-purple/20 to-medisync-purple/5">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Button 
                  variant="default" 
                  className="w-full justify-start bg-medisync-purple hover:bg-medisync-purple-dark"
                  onClick={() => navigate('/doctors')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Book New Appointment
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/doctors')}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Find Doctors
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/profile')}
                >
                  <User className="mr-2 h-4 w-4" />
                  Manage Profile
                </Button>
              </div>
            </Card>
            
            {/* Account Balance */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Account Balance</h2>
              <div className="text-3xl font-bold text-medisync-purple-dark">
                ${profile.balance?.toFixed(2) || '0.00'}
              </div>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full mt-2 border-medisync-purple text-medisync-purple hover:bg-medisync-purple/10"
                  onClick={() => navigate('/profile')}
                >
                  Add Funds
                </Button>
              </div>
            </Card>
            
            {/* Upcoming Next */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Next Appointment</h2>
              {upcomingAppointments.length > 0 ? (
                <div>
                  <div className="flex items-center mb-3">
                    <Calendar className="h-5 w-5 text-medisync-purple mr-2" />
                    <span className="font-medium">{upcomingAppointments[0].doctorName}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {new Date(upcomingAppointments[0].startTime).toLocaleDateString()} at{' '}
                    {new Date(upcomingAppointments[0].startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                 
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-2">No upcoming appointments</p>
                  <Button 
                    variant="link" 
                    className="text-medisync-purple"
                    onClick={() => navigate('/doctors')}
                  >
                    Book an appointment
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}
        
        {/* Appointments */}
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-6">Your Appointments</h2>
          
          {appointments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <h3 className="text-xl font-medium text-gray-900 mb-2">No appointments yet</h3>
              <p className="text-gray-500 mb-6">You haven't scheduled any appointments yet.</p>
              <Button 
                onClick={() => navigate('/doctors')}
                className="bg-medisync-purple hover:bg-medisync-purple-dark"
              >
                Book Your First Appointment
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Upcoming Appointments */}
              {upcomingAppointments.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Appointments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingAppointments.map(appointment => (
                      <AppointmentCard
                        key={appointment.appointmentid}
                        appointment={appointment}
                        onCancel={handleCancelAppointment}
                        onPay={handlePayment}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Past Appointments */}
              {pastAppointments.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Past Appointments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pastAppointments.slice(0, 3).map(appointment => (
                      <AppointmentCard
                        key={appointment.appointmentid}
                        appointment={appointment}
                        onReview={appointment.status === 'completed' && !appointment.rating ? handleReviewAppointment : undefined}
                        onPay={handlePayment}
                      />
                    ))}
                  </div>
                  
                  {pastAppointments.length > 3 && (
                    <div className="text-center mt-6">
                      
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
