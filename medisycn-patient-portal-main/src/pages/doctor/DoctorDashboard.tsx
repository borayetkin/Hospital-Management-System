
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { doctorApi } from '@/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Users, CalendarDays, Star } from 'lucide-react';
import { format } from 'date-fns';
import Navbar from '@/components/Navbar';

const DoctorDashboard = () => {
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['doctorProfile'],
    queryFn: doctorApi.getProfile,
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['doctorAppointments', 'upcoming'],
    queryFn: () => doctorApi.getAppointments(undefined, true),
  });

  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ['doctorPatients'],
    queryFn: doctorApi.getPatients,
  });

  const isLoading = profileLoading || appointmentsLoading || patientsLoading;

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
                                appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                                appointment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {appointment.status}
                              </span>
                            </p>
                          </div>
                          <Button>View Details</Button>
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
                      .filter(app => app.status === 'Scheduled')
                      .map(appointment => (
                        <div key={appointment.appointmentID} className="p-4 border rounded-md flex justify-between items-center">
                          <div>
                            <p className="font-medium">Patient ID: {appointment.patientID}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(appointment.startTime), 'PPP')} at {format(new Date(appointment.startTime), 'h:mm a')}
                            </p>
                          </div>
                          <Button>View Details</Button>
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
    </div>
  );
};

export default DoctorDashboard;
