import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorApi } from '@/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@/types';
import Navbar from '@/components/Navbar';

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

const AppointmentManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<'scheduled' | 'completed' | 'cancelled'>('scheduled');

  const { data: appointments, isLoading, refetch } = useQuery({
    queryKey: ['doctorAppointments'],
    queryFn: () => doctorApi.getAppointments(),
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: ({appointmentId, status}: {appointmentId: number, status: 'scheduled' | 'completed' | 'cancelled'}) => {
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
      console.log('Mutation succeeded, transformed data:', data);
      
      // Force refetch appointments to get updated data
      refetch();
      
      // Also invalidate the query cache
      queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] });
      
      toast({
        title: "Appointment updated",
        description: `Appointment status changed to ${variables.status}`,
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
        queryClient.setQueryData(['doctorAppointments'], updatedAppointments);
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

  const openUpdateDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setNewStatus(appointment.status);
    setIsDialogOpen(true);
  };

  const handleUpdateStatus = () => {
    if (selectedAppointment) {
      console.log('handleUpdateStatus called with:', { 
        appointmentID: selectedAppointment.appointmentID, 
        currentStatus: selectedAppointment.status,
        newStatus 
      });
      updateAppointmentMutation.mutate({
        appointmentId: selectedAppointment.appointmentID,
        status: newStatus
      });
    } else {
      console.error('No appointment selected');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Navbar />
        <div className="my-8">
          <h1 className="text-3xl font-semibold mb-6">Appointment Management</h1>
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  const scheduledAppointments = appointments?.filter(app => app.status === 'scheduled') || [];
  const completedAppointments = appointments?.filter(app => app.status === 'completed') || [];
  const cancelledAppointments = appointments?.filter(app => app.status === 'cancelled') || [];

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <div className="my-8">
        <h1 className="text-3xl font-semibold mb-6">Appointment Management</h1>
        
        <Tabs defaultValue="scheduled" className="w-full">
          <TabsList>
            <TabsTrigger value="scheduled">Scheduled ({scheduledAppointments.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedAppointments.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({cancelledAppointments.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scheduled" className="mt-4">
            <AppointmentList 
              appointments={scheduledAppointments} 
              onUpdateStatus={openUpdateDialog} 
            />
          </TabsContent>
          
          <TabsContent value="completed" className="mt-4">
            <AppointmentList 
              appointments={completedAppointments} 
              onUpdateStatus={openUpdateDialog} 
            />
          </TabsContent>
          
          <TabsContent value="cancelled" className="mt-4">
            <AppointmentList 
              appointments={cancelledAppointments} 
              onUpdateStatus={openUpdateDialog} 
            />
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Appointment Status</DialogTitle>
              <DialogDescription>
                Change the status of this appointment.
              </DialogDescription>
            </DialogHeader>
            
            <div className="my-4">
              <p className="mb-2">Appointment Date:</p>
              <p className="font-medium">
                {selectedAppointment && format(new Date(selectedAppointment.startTime), 'PPP')}
              </p>
              <p className="mb-4 text-sm text-muted-foreground">
                {selectedAppointment && format(new Date(selectedAppointment.startTime), 'h:mm a')} - 
                {selectedAppointment && format(new Date(selectedAppointment.endTime), 'h:mm a')}
              </p>
              
              <p className="mb-2">Current Status: <span className="font-medium">{selectedAppointment?.status}</span></p>
              
              <div className="mt-4">
                <p className="mb-2">New Status:</p>
                <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateStatus} disabled={updateAppointmentMutation.isPending}>
                {updateAppointmentMutation.isPending ? "Updating..." : "Update Status"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

interface AppointmentListProps {
  appointments: Appointment[];
  onUpdateStatus: (appointment: Appointment) => void;
}

const AppointmentList = ({ appointments, onUpdateStatus }: AppointmentListProps) => {
  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-4 text-amber-500">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>No appointments found in this category.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.appointmentID} 
                className="p-4 border rounded-md flex flex-col sm:flex-row justify-between">
              <div>
                <p className="font-medium">Patient ID: {appointment.patientID}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(appointment.startTime), 'PPP')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(appointment.startTime), 'h:mm a')} - 
                  {format(new Date(appointment.endTime), 'h:mm a')}
                </p>
                <p className="text-sm mt-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {appointment.status}
                  </span>
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  onClick={() => onUpdateStatus(appointment)}
                >
                  Update Status
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentManagement;
