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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Appointment } from '@/types';
import { useToast } from '@/hooks/use-toast';

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
    status: (data.status || '').toLowerCase() as 'scheduled' | 'completed' | 'cancelled',
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

  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ['doctorPatients'],
    queryFn: doctorApi.getPatients,
  });

  const isLoading = profileLoading || appointmentsLoading || patientsLoading;

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

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Navbar />
        <div className="my-8 flex justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Loading dashboard...</h1>
            <Progress value={30} className="w-[80vw] max-w-md" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <div className="my-8">
        <h1 className="text-3xl font-semibold mb-6">Doctor Dashboard</h1>
        
        {/* Doctor Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CalendarDays className="h-5 w-5 text-medisync-purple mr-2" />
                <span className="text-2xl font-bold">
                  {profile?.appointmentCount || 0}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-2xl font-bold">
                  {profile?.avgRating?.toFixed(1) || "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-medisync-purple mr-2" />
                <span className="text-2xl font-bold">
                  {patients?.length || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="today" className="w-full">
          <TabsList>
            <TabsTrigger value="today">Today's Appointments</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="today" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Appointments for Today</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments && appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments
                      .filter(app => {
                        const appointmentDate = new Date(app.startTime);
                        const today = new Date();
                        return (
                          appointmentDate.getDate() === today.getDate() &&
                          appointmentDate.getMonth() === today.getMonth() &&
                          appointmentDate.getFullYear() === today.getFullYear()
                        );
                      })
                      .map(appointment => (
                        <div key={appointment.appointmentID} className="p-4 border rounded-md flex justify-between items-center">
                          <div>
                            <p className="font-medium">Patient ID: {appointment.patientID}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(appointment.startTime), 'h:mm a')} - {format(new Date(appointment.endTime), 'h:mm a')}
                            </p>
                            <p className="text-sm mt-1">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                                appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {appointment.status}
                              </span>
                            </p>
                          </div>
                          <Button onClick={() => handleViewDetails(appointment)}>View Details</Button>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <Alert>
                    <AlertTitle>No appointments for today</AlertTitle>
                    <AlertDescription>
                      You have no scheduled appointments for today.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="upcoming" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments && appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments
                      .filter(app => app.status === 'scheduled')
                      .map(appointment => (
                        <div key={appointment.appointmentID} className="p-4 border rounded-md flex justify-between items-center">
                          <div>
                            <p className="font-medium">Patient ID: {appointment.patientID}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(appointment.startTime), 'PPP')} at {format(new Date(appointment.startTime), 'h:mm a')}
                            </p>
                          </div>
                          <Button onClick={() => handleViewDetails(appointment)}>View Details</Button>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <Alert>
                    <AlertTitle>No upcoming appointments</AlertTitle>
                    <AlertDescription>
                      You have no upcoming scheduled appointments.
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
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              Appointment #{selectedAppointment?.appointmentID}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Patient ID:</div>
                <div className="text-sm">{selectedAppointment.patientID}</div>
                
                <div className="text-sm font-medium">Date:</div>
                <div className="text-sm">{format(new Date(selectedAppointment.startTime), 'PPP')}</div>
                
                <div className="text-sm font-medium">Time:</div>
                <div className="text-sm">
                  {format(new Date(selectedAppointment.startTime), 'h:mm a')} - 
                  {format(new Date(selectedAppointment.endTime), 'h:mm a')}
                </div>
                
                <div className="text-sm font-medium">Status:</div>
                <div className="text-sm">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    selectedAppointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    selectedAppointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedAppointment.status}
                  </span>
                </div>
                
                {selectedAppointment.status === 'completed' && (
                  <>
                    <div className="text-sm font-medium">Rating:</div>
                    <div className="text-sm flex items-center">
                      {selectedAppointment.rating || 'No rating'} {selectedAppointment.rating && (
                        <Star className="h-4 w-4 text-yellow-500 ml-1" />
                      )}
                    </div>
                    
                    <div className="text-sm font-medium">Review:</div>
                    <div className="text-sm">{selectedAppointment.review || 'No review'}</div>
                  </>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                {selectedAppointment.status === 'scheduled' && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={handleCancelAppointment}
                      disabled={updateAppointmentStatusMutation.isPending}
                    >
                      {updateAppointmentStatusMutation.isPending ? 'Updating...' : 'Cancel'}
                    </Button>
                  </>
                )}
                {(selectedAppointment.status === 'completed' || selectedAppointment.status === 'cancelled') && (
                  <Button size="sm" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Close
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorDashboard;
