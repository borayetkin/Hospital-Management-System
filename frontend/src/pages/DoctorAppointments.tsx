import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, Check, X, AlertCircle } from 'lucide-react';
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { Appointment } from '@/types';

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

const AppointmentCard = ({ 
  appointment, 
  patientName,
  onStatusChange
}: { 
  appointment: Appointment, 
  patientName: string,
  onStatusChange: (appointmentId: string, newStatus: 'completed' | 'cancelled') => void 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-start gap-4 pb-2">
        <Avatar>
          <AvatarFallback>{getInitials(patientName)}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <CardTitle className="text-lg">{patientName}</CardTitle>
          <CardDescription>Patient</CardDescription>
        </div>
        <div className="ml-auto">
          <Badge className={getStatusColor(appointment.status)} variant="outline">
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(appointment.date)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{appointment.startTime} - {appointment.endTime}</span>
          </div>
        </div>
        <Separator className="my-2" />
        <div className="text-sm">
          <div className="font-medium">Reason for visit:</div>
          <p className="text-muted-foreground">{appointment.reason || "Not specified"}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5">
            <div className="text-sm font-medium">
              Amount: ${appointment.price}
            </div>
            <Badge variant="outline" className="ml-1 text-xs">
              {appointment.isPaid ? 'Paid' : 'Unpaid'}
            </Badge>
          </div>
        </div>
      </CardContent>
      {appointment.status === 'scheduled' && (
        <CardFooter className="gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => onStatusChange(appointment.id, 'completed')}
          >
            <Check className="mr-2 h-4 w-4" />
            Mark Completed
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => onStatusChange(appointment.id, 'cancelled')}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

const DoctorAppointments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientsMap, setPatientsMap] = useState<Map<string, string>>(new Map());
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    appointmentId: string;
    status: 'completed' | 'cancelled';
  }>({ open: false, appointmentId: '', status: 'completed' });

  useEffect(() => {
    if (!user || user.role !== 'doctor') {
      navigate('/login');
      return;
    }

    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const appointmentsData = await dataService.getDoctorAppointments(user.id);
        setAppointments(appointmentsData);
        
        // Fetch patient names for these appointments
        const patientsData = new Map<string, string>();
        for (const appointment of appointmentsData) {
          if (!patientsData.has(appointment.patientId)) {
            const patient = await dataService.getPatient(appointment.patientId);
            if (patient) {
              patientsData.set(appointment.patientId, patient.name);
            }
          }
        }
        setPatientsMap(patientsData);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast.error('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user, navigate]);

  const handleStatusChange = (appointmentId: string, newStatus: 'completed' | 'cancelled') => {
    setConfirmDialog({
      open: true,
      appointmentId,
      status: newStatus
    });
  };

  const confirmStatusChange = async () => {
    try {
      // In a real app, this would call an API to update the appointment status
      const updatedAppointments = appointments.map(appointment => {
        if (appointment.id === confirmDialog.appointmentId) {
          return { ...appointment, status: confirmDialog.status };
        }
        return appointment;
      });
      
      setAppointments(updatedAppointments);
      toast.success(`Appointment ${confirmDialog.status} successfully`);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    } finally {
      setConfirmDialog({ open: false, appointmentId: '', status: 'completed' });
    }
  };

  // Filter appointments by status
  const upcomingAppointments = appointments.filter(a => a.status === 'scheduled');
  const pastAppointments = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Appointments</h1>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <h3 className="text-lg font-medium mb-2">No upcoming appointments</h3>
              <p className="text-muted-foreground">You don't have any scheduled appointments.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingAppointments.map((appointment) => {
                const patientName = patientsMap.get(appointment.patientId) || 'Unknown Patient';
                return (
                  <AppointmentCard 
                    key={appointment.id} 
                    appointment={appointment} 
                    patientName={patientName}
                    onStatusChange={handleStatusChange}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pastAppointments.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <h3 className="text-lg font-medium">No past appointments</h3>
              <p className="text-muted-foreground">Your appointment history will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pastAppointments.map((appointment) => {
                const patientName = patientsMap.get(appointment.patientId) || 'Unknown Patient';
                return (
                  <AppointmentCard 
                    key={appointment.id} 
                    appointment={appointment} 
                    patientName={patientName}
                    onStatusChange={handleStatusChange}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog(prev => ({ ...prev, open: false }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this appointment as {confirmDialog.status}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center justify-center text-center">
              {confirmDialog.status === 'completed' ? (
                <div className="flex items-center">
                  <Check className="h-8 w-8 text-green-500 mr-2" />
                  <span>This will complete the appointment and notify the patient.</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
                  <span>This will cancel the appointment and notify the patient.</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
              Cancel
            </Button>
            <Button 
              variant={confirmDialog.status === 'completed' ? 'default' : 'destructive'} 
              onClick={confirmStatusChange}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorAppointments;
