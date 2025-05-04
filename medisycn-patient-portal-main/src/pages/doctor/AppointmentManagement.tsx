
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

const AppointmentManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<'Scheduled' | 'Completed' | 'Cancelled'>('Scheduled');

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['doctorAppointments'],
    queryFn: () => doctorApi.getAppointments(),
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: ({appointmentId, status}: {appointmentId: number, status: 'Scheduled' | 'Completed' | 'Cancelled'}) => 
      doctorApi.updateAppointmentStatus(appointmentId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] });
      toast({
        title: "Appointment updated",
        description: `Appointment status changed to ${newStatus}`,
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error updating appointment",
        description: "An error occurred while updating the appointment status.",
        variant: "destructive",
      });
      console.error("Update error:", error);
    },
  });

  const openUpdateDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setNewStatus(appointment.status);
    setIsDialogOpen(true);
  };

  const handleUpdateStatus = () => {
    if (selectedAppointment) {
      updateAppointmentMutation.mutate({
        appointmentId: selectedAppointment.appointmentID,
        status: newStatus
      });
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

  const scheduledAppointments = appointments?.filter(app => app.status === 'Scheduled') || [];
  const completedAppointments = appointments?.filter(app => app.status === 'Completed') || [];
  const cancelledAppointments = appointments?.filter(app => app.status === 'Cancelled') || [];

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
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
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
                    appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                    appointment.status === 'Completed' ? 'bg-green-100 text-green-800' :
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
