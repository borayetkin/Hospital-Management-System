import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorApi } from '@/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Users, CalendarDays, Star } from 'lucide-react';
import { format } from 'date-fns';
import Navbar from '@/components/Navbar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Appointment } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

// Helper function to capitalize the first letter of a string
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Transform API response to match frontend format
const transformAppointmentData = (data: any): Appointment => {
  return {
    appointmentID: data.appointmentid || data.appointment_id || data.appointmentID,
    patientID: data.patientid || data.patient_id || data.patientID,
    doctorID: data.doctorid || data.doctor_id || data.doctorID,
    doctorName: data.doctorname || data.doctor_name || data.doctorName,
    startTime: data.starttime || data.start_time || data.startTime,
    endTime: data.endtime || data.end_time || data.endTime,
    status: (data.status || '').toLowerCase(),
    rating: data.rating,
    review: data.review,
    specialization: data.specialization
  };
};

const DoctorDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['doctorProfile'],
    queryFn: doctorApi.getProfile,
  });

  const { data: appointments, isLoading: appointmentsLoading, refetch: refetchAppointments } = useQuery({
    queryKey: ['doctorAppointments', 'upcoming'],
    queryFn: () => doctorApi.getAppointments(undefined, true),
  });

  const isLoading = profileLoading || appointmentsLoading;

  // Mutation for updating appointment status
  const updateAppointmentStatusMutation = useMutation({
    mutationFn: ({ appointmentId, status }: { appointmentId: number, status: 'scheduled' | 'completed' | 'cancelled' }) => {
      console.log('Mutation called with:', { appointmentId, status });
      // Send capitalized status to match what the API expects
      return fetch(`http://localhost:8000/api/v1/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: capitalize(status) })
      }).then(async response => {
        console.log(`Direct API Response status: ${response.status}`);
        if (!response.ok) {
          const text = await response.text();
          try {
            const errorData = JSON.parse(text);
            console.error('API error response:', errorData);
            throw new Error(errorData.detail || `Failed to update status: ${response.status}`);
          } catch (e) {
            console.error('API error response (not JSON):', text);
            throw new Error(`Failed to update status: ${response.status}`);
          }
        }
        const data = await response.json();
        // Transform the data to match the frontend format
        return transformAppointmentData(data);
      });
    },
    onSuccess: (data, variables) => {
      console.log('Cancel mutation succeeded, transformed data:', data);
      
      // Force refetch appointments to get updated data
      refetchAppointments();
      
      // Also invalidate the query cache to ensure a fresh fetch
      queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] });
      
      toast({
        title: "Appointment updated",
        description: `Appointment has been ${variables.status}`,
      });
      setIsDialogOpen(false);
      
      // Update the local state immediately for a responsive UI
      if (appointments && selectedAppointment) {
        const updatedAppointments = appointments.map(appointment => 
          appointment.appointmentID === variables.appointmentId 
            ? data // Use the transformed data from the API response
            : appointment
        );
        
        // Update the appointments data directly in the query cache
        queryClient.setQueryData(['doctorAppointments', 'upcoming'], updatedAppointments);
      }
    },
    onError: (error) => {
      console.error("Update error details:", error);
      toast({
        title: "Error updating appointment",
        description: "An error occurred while updating the appointment status.",
        variant: "destructive",
      });
    },
  });

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDialogOpen(true);
  };

  const handleCompleteAppointment = () => {
    if (selectedAppointment) {
      updateAppointmentStatusMutation.mutate({
        appointmentId: selectedAppointment.appointmentID,
        status: 'completed'
      });
    }
  };

  const handleCancelAppointment = () => {
    if (selectedAppointment) {
      updateAppointmentStatusMutation.mutate({
        appointmentId: selectedAppointment.appointmentID,
        status: 'cancelled'
      });
    }
  };

  // Function to get today's appointments
  const getTodayAppointments = () => {
    if (!appointments) return [];
    const today = new Date();
    return appointments.filter(app => {
      const appointmentDate = new Date(app.startTime);
      return (
        appointmentDate.getDate() === today.getDate() &&
        appointmentDate.getMonth() === today.getMonth() &&
        appointmentDate.getFullYear() === today.getFullYear()
      );
    });
  };

  // Function to get upcoming appointments (excluding today)
  const getUpcomingAppointments = () => {
    if (!appointments) return [];
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    return appointments
      .filter(app => {
        const appointmentDate = new Date(app.startTime);
        return appointmentDate > today && app.status === 'scheduled';
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };

  const todayAppointments = getTodayAppointments();
  const upcomingAppointments = getUpcomingAppointments();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center">
            <div className="w-full max-w-lg flex flex-col items-center">
              <h2 className="text-xl font-medium mb-6 text-center">Loading your dashboard</h2>
              <Progress value={45} className="w-full h-2 mb-2" />
              <p className="text-sm text-muted-foreground">Please wait while we fetch your data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-medisync-dark-purple">Doctor Dashboard</h1>
        {/* Doctor Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-medisync-purple/10 mr-3">
                  <CalendarDays className="h-5 w-5 text-medisync-purple" />
                </div>
                <span className="text-3xl font-bold text-medisync-dark-purple">
                  {profile?.appointmentCount || 0}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-yellow-100 mr-3">
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
                <span className="text-3xl font-bold text-medisync-dark-purple">
                  {profile?.avgRating?.toFixed(1) || "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        <Tabs defaultValue="today" className="w-full">
          <div className="mb-4 border-b">
            <TabsList className="bg-transparent">
              <TabsTrigger 
                value="today" 
                className="data-[state=active]:border-medisync-purple data-[state=active]:text-medisync-purple data-[state=active]:border-b-2 rounded-none border-b-2 border-transparent px-4 py-2"
              >
                Today's Appointments
              </TabsTrigger>
              <TabsTrigger 
                value="upcoming"
                className="data-[state=active]:border-medisync-purple data-[state=active]:text-medisync-purple data-[state=active]:border-b-2 rounded-none border-b-2 border-transparent px-4 py-2"
              >
                Upcoming Appointments
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="today" className="mt-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="bg-gradient-to-r from-medisync-purple/5 to-transparent">
                <CardTitle className="text-xl text-medisync-dark-purple">Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {todayAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {todayAppointments.map(appointment => (
                      <div 
                        key={appointment.appointmentID} 
                        className="p-4 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white flex justify-between items-center"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}
                            >
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </div>
                          <p className="font-medium text-medisync-dark-purple">Patient ID: {appointment.patientID}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(appointment.startTime), 'h:mm a')} - {format(new Date(appointment.endTime), 'h:mm a')}
                          </p>
                        </div>
                        <Button 
                          onClick={() => handleViewDetails(appointment)}
                          className="bg-medisync-purple hover:bg-medisync-purple-dark text-white"
                        >
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert className="bg-blue-50 border-blue-100">
                    <CalendarDays className="h-5 w-5 text-blue-500" />
                    <AlertTitle className="text-blue-700 font-medium">No appointments for today</AlertTitle>
                    <AlertDescription className="text-blue-600">
                      You have no scheduled appointments for today. Enjoy your day!
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="upcoming" className="mt-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="bg-gradient-to-r from-medisync-purple/5 to-transparent">
                <CardTitle className="text-xl text-medisync-dark-purple">Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map(appointment => (
                      <div 
                        key={appointment.appointmentID} 
                        className="p-4 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium text-medisync-dark-purple">Patient ID: {appointment.patientID}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(appointment.startTime), 'EEEE, MMMM d')} at {format(new Date(appointment.startTime), 'h:mm a')}
                          </p>
                        </div>
                        <Button 
                          onClick={() => handleViewDetails(appointment)}
                          className="bg-medisync-purple hover:bg-medisync-purple-dark text-white"
                        >
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert className="bg-amber-50 border-amber-100">
                    <CalendarDays className="h-5 w-5 text-amber-500" />
                    <AlertTitle className="text-amber-700 font-medium">No upcoming appointments</AlertTitle>
                    <AlertDescription className="text-amber-600">
                      You have no upcoming scheduled appointments at the moment.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {/* Appointment Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-medisync-dark-purple">Appointment Details</DialogTitle>
            <DialogDescription>
              Appointment #{selectedAppointment?.appointmentID}
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-sm font-medium text-gray-500">Patient ID:</div>
                <div className="text-sm font-semibold">{selectedAppointment.patientID}</div>
                <div className="text-sm font-medium text-gray-500">Date:</div>
                <div className="text-sm font-semibold">
                  {format(new Date(selectedAppointment.startTime), 'EEEE, MMMM d, yyyy')}
                </div>
                <div className="text-sm font-medium text-gray-500">Time:</div>
                <div className="text-sm font-semibold">
                  {format(new Date(selectedAppointment.startTime), 'h:mm a')} - 
                  {format(new Date(selectedAppointment.endTime), 'h:mm a')}
                </div>
                <div className="text-sm font-medium text-gray-500">Status:</div>
                <div className="text-sm">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium 
                    ${selectedAppointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      selectedAppointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                  </span>
                </div>
                {selectedAppointment.status === 'completed' && (
                  <>
                    <div className="text-sm font-medium text-gray-500">Rating:</div>
                    <div className="text-sm flex items-center">
                      {selectedAppointment.rating || 'No rating'} {selectedAppointment.rating && (
                        <Star className="h-4 w-4 text-yellow-500 ml-1" />
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-500">Review:</div>
                    <div className="text-sm">{selectedAppointment.review || 'No review'}</div>
                  </>
                )}
              </div>
              <DialogFooter className="mt-6">
                <Button 
                  onClick={() => setIsDialogOpen(false)}
                  className="bg-medisync-purple hover:bg-medisync-purple-dark text-white"
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorDashboard;
