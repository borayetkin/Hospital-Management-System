import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorApi } from '@/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AlertCircle, Plus } from 'lucide-react';
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@/types';
import Navbar from '@/components/Navbar';

// Helper function to capitalize the first letter of a string
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Transform API response to match frontend format
const transformAppointmentData = (data: any): Appointment => {
  return {
    appointmentid: data.appointmentid || data.appointment_id,
    patientid: data.patientid || data.patient_id,
    doctorID: data.doctorid || data.doctor_id,
    doctorName: data.doctorname || data.doctor_name,
    startTime: data.starttime || data.start_time,
    endTime: data.endtime || data.end_time,
    status: (data.status || '').toLowerCase() as 'scheduled' | 'completed' | 'cancelled',
    rating: data.rating,
    review: data.review,
    specialization: data.specialization,
    processes: data.processes?.map((process: any) => ({
      processid: process.processid,
      processName: process.processName,
      processDescription: process.processDescription,
      status: process.status,
      billing: process.billing
    })) || []
  };
};

interface Process {
  processid: number;
  processName: string;
  processDescription: string;
  status: string;
  amount: number;
  paymentStatus: string;
}

const getStatusBadgeClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'scheduled': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'completed': return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'cancelled': return 'bg-red-100 text-red-800 hover:bg-red-200';
    case 'in progress': return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
    default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

const AppointmentManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<'scheduled' | 'completed' | 'cancelled'>('scheduled');
  const [newProcess, setNewProcess] = useState({
    processName: '',
    processDescription: '',
    amount: 0
  });

  const { data: appointments, isLoading, refetch } = useQuery({
    queryKey: ['doctorAppointments'],
    queryFn: () => doctorApi.getAppointments(),
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: ({appointmentId, status}: {appointmentId: number, status: 'scheduled' | 'completed' | 'cancelled'}) => {
      return fetch(`http://localhost:8000/api/v1/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: capitalize(status) })
      }).then(async response => {
        if (!response.ok) {
          const text = await response.text();
          try {
            const errorData = JSON.parse(text);
            throw new Error(errorData.detail || `Failed to update status: ${response.status}`);
          } catch (e) {
            throw new Error(`Failed to update status: ${response.status}`);
          }
        }
        return response.json();
      });
    },
    onSuccess: () => {
      refetch();
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
    },
  });

  const { data: processes, refetch: refetchProcesses } = useQuery({
    queryKey: ['appointmentProcesses', selectedAppointment?.appointmentid],
    queryFn: () => {
      if (!selectedAppointment) return Promise.resolve([]);
      return fetch(`http://localhost:8000/api/v1/processes/appointment/${selectedAppointment.appointmentid}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => res.json());
    },
    enabled: !!selectedAppointment
  });

  const createProcessMutation = useMutation({
    mutationFn: (processData: { processName: string; processDescription: string; amount: number }) => {
      if (!selectedAppointment) throw new Error('No appointment selected');
      return fetch('http://localhost:8000/api/v1/processes/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...processData,
          appointmentID: selectedAppointment.appointmentid
        })
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: "Process created",
        description: "New medical process has been added successfully.",
      });
      refetchProcesses();
      setIsProcessDialogOpen(false);
      setNewProcess({ processName: '', processDescription: '', amount: 0 });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create process.",
        variant: "destructive",
      });
    }
  });

  const updateProcessStatusMutation = useMutation({
    mutationFn: ({ processId, status }: { processId: number; status: string }) => {
      return fetch(`http://localhost:8000/api/v1/processes/${processId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: "Process updated",
        description: "Process status has been updated successfully.",
      });
      refetchProcesses();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update process status.",
        variant: "destructive",
      });
    }
  });

  const openUpdateDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setNewStatus(appointment.status as 'scheduled' | 'completed' | 'cancelled');
    setIsDialogOpen(true);
  };

  const handleUpdateStatus = () => {
    if (selectedAppointment) {
      updateAppointmentMutation.mutate({
        appointmentId: selectedAppointment.appointmentid,
        status: newStatus
      });
    }
  };

  const openProcessDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsProcessDialogOpen(true);
  };

  const handleCreateProcess = () => {
    createProcessMutation.mutate(newProcess);
  };

  const handleUpdateProcessStatus = (processId: number, status: string) => {
    updateProcessStatusMutation.mutate({ processId, status });
  };

  const handlePayment = async (processId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/processes/${processId}/pay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      toast({
        title: "Payment successful",
        description: "The process payment has been processed successfully.",
      });
      
      refetchProcesses();
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "There was an error processing the payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-medisync-dark-purple">Appointment Management</h1>
          <div className="flex justify-center items-center py-12">
            <div className="animate-pulse-light text-medisync-purple">
              <p className="text-lg">Loading appointments...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const scheduledAppointments = appointments?.filter(app => app.status === 'scheduled') || [];
  const completedAppointments = appointments?.filter(app => app.status === 'completed') || [];
  const cancelledAppointments = appointments?.filter(app => app.status === 'cancelled') || [];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-medisync-dark-purple">Appointment Management</h1>
        <Tabs defaultValue="scheduled" className="w-full">
          <div className="mb-6 border-b">
            <TabsList className="bg-transparent">
              <TabsTrigger 
                value="scheduled" 
                className="data-[state=active]:border-medisync-purple data-[state=active]:text-medisync-purple data-[state=active]:border-b-2 rounded-none border-b-2 border-transparent px-6 py-3"
              >
                Scheduled ({scheduledAppointments.length})
              </TabsTrigger>
              <TabsTrigger 
                value="completed"
                className="data-[state=active]:border-medisync-purple data-[state=active]:text-medisync-purple data-[state=active]:border-b-2 rounded-none border-b-2 border-transparent px-6 py-3"
              >
                Completed ({completedAppointments.length})
              </TabsTrigger>
              <TabsTrigger 
                value="cancelled"
                className="data-[state=active]:border-medisync-purple data-[state=active]:text-medisync-purple data-[state=active]:border-b-2 rounded-none border-b-2 border-transparent px-6 py-3"
              >
                Cancelled ({cancelledAppointments.length})
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="scheduled" className="mt-4">
            <AppointmentList 
              appointments={scheduledAppointments} 
              onUpdateStatus={openUpdateDialog} 
              onManageProcesses={openProcessDialog}
              status="scheduled"
            />
          </TabsContent>
          <TabsContent value="completed" className="mt-4">
            <AppointmentList 
              appointments={completedAppointments} 
              onUpdateStatus={openUpdateDialog} 
              onManageProcesses={openProcessDialog}
              status="completed"
            />
          </TabsContent>
          <TabsContent value="cancelled" className="mt-4">
            <AppointmentList 
              appointments={cancelledAppointments} 
              onUpdateStatus={openUpdateDialog} 
              onManageProcesses={openProcessDialog}
              status="cancelled"
            />
          </TabsContent>
        </Tabs>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl text-medisync-dark-purple">Update Appointment Status</DialogTitle>
              <DialogDescription>
                Change the status of this appointment.
              </DialogDescription>
            </DialogHeader>
            <div className="my-4 space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Appointment Date:</p>
                <p className="font-medium">
                  {selectedAppointment && format(new Date(selectedAppointment.startTime), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Time:</p>
                <p className="text-gray-700">
                  {selectedAppointment && format(new Date(selectedAppointment.startTime), 'h:mm a')} - 
                  {selectedAppointment && format(new Date(selectedAppointment.endTime), 'h:mm a')}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Current Status:</p>
                <p className="font-medium">
                  <span className={getStatusBadgeClass(selectedAppointment?.status || '')}>
                    {selectedAppointment?.status.charAt(0).toUpperCase() + (selectedAppointment?.status.slice(1) || '')}
                  </span>
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">New Status:</p>
                <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
                  <SelectTrigger className="w-full">
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
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateStatus} 
                disabled={updateAppointmentMutation.isPending}
                className="bg-medisync-purple hover:bg-medisync-purple-dark text-white"
              >
                {updateAppointmentMutation.isPending ? "Updating..." : "Update Status"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Process Management Dialog */}
        <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-xl text-medisync-dark-purple">Medical Processes</DialogTitle>
              <DialogDescription>
                Add and manage medical processes for this appointment.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="space-y-4">
                {/* Add New Process Form */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-medium text-medisync-dark-purple mb-3">Add New Medical Process</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Process Name</label>
                      <Input
                        value={newProcess.processName}
                        onChange={(e) => setNewProcess(prev => ({ ...prev, processName: e.target.value }))}
                        placeholder="Enter process name"
                        className="border-gray-300 focus:border-medisync-purple focus:ring-medisync-purple"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
                      <Textarea
                        value={newProcess.processDescription}
                        onChange={(e) => setNewProcess(prev => ({ ...prev, processDescription: e.target.value }))}
                        placeholder="Enter process description"
                        className="border-gray-300 focus:border-medisync-purple focus:ring-medisync-purple"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Amount ($)</label>
                      <Input
                        type="number"
                        value={newProcess.amount}
                        onChange={(e) => setNewProcess(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                        placeholder="Enter amount"
                        className="border-gray-300 focus:border-medisync-purple focus:ring-medisync-purple"
                      />
                    </div>
                    <Button 
                      onClick={handleCreateProcess}
                      disabled={createProcessMutation.isPending}
                      className="w-full bg-medisync-purple hover:bg-medisync-purple-dark text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {createProcessMutation.isPending ? "Adding..." : "Add Process"}
                    </Button>
                  </div>
                </div>
                {/* Existing Processes List */}
                <div className="border p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-medisync-dark-purple mb-3">Existing Processes</h3>
                  <div className="space-y-3">
                    {processes && processes.length > 0 ? (
                      processes.map((process: Process) => (
                        <div key={process.processid} className="bg-white p-3 rounded-md border shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-medisync-dark-purple">{process.processName}</h4>
                                <span className={getStatusBadgeClass(process.status)}>
                                  {process.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{process.processDescription}</p>
                              <div className="mt-2 flex justify-between items-center">
                                <div className="text-sm">
                                  <span className="font-medium">Amount: </span>
                                  <span className="text-medisync-purple">${process.billing.amount}</span>
                                </div>
                                {process.paymentStatus === 'pending' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handlePayment(process.processid)}
                                    className="bg-medisync-purple hover:bg-medisync-purple/90"
                                  >
                                    Pay Now
                                  </Button>
                                )}
                              </div>
                            </div>
                            <div className="ml-4">
                              <Select
                                value={process.status}
                                onValueChange={(value) => handleUpdateProcessStatus(process.processid, value)}
                              >
                                <SelectTrigger className="w-[140px] border-gray-300 focus:border-medisync-purple focus:ring-medisync-purple">
                                  <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                                  <SelectItem value="In Progress">In Progress</SelectItem>
                                  <SelectItem value="Completed">Completed</SelectItem>
                                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No processes found for this appointment.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button 
                variant="outline"
                onClick={() => setIsProcessDialogOpen(false)}
                className="border-medisync-purple text-medisync-purple hover:bg-medisync-purple/5"
              >
                Close
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
  onManageProcesses: (appointment: Appointment) => void;
  status: string;
}

const AppointmentList = ({ appointments, onUpdateStatus, onManageProcesses, status }: AppointmentListProps) => {
  if (appointments.length === 0) {
    return (
      <Card className="border border-gray-100 shadow-sm bg-white">
        <CardContent className="pt-6 pb-8">
          <div className="flex flex-col items-center justify-center py-10 text-amber-500">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium text-center text-amber-600">No {status} appointments found</p>
            <p className="text-gray-500 text-center mt-2">
              {status === 'scheduled' ? 
                'You currently have no scheduled appointments.' : 
                status === 'completed' ?
                'You have no completed appointments in the system.' :
                'You have no cancelled appointments in the system.'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-100 shadow-sm bg-white">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-xl text-medisync-dark-purple">{capitalize(status)} Appointments</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div 
              key={appointment.appointmentid} 
              className="p-5 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all bg-white hover:border-medisync-purple/20"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h3 className="font-medium text-medisync-dark-purple">Patient ID: {appointment.patientid}</h3>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    {format(new Date(appointment.startTime), 'EEEE, MMMM d, yyyy')}
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Time: </span>
                    {format(new Date(appointment.startTime), 'h:mm a')} - {format(new Date(appointment.endTime), 'h:mm a')}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    className="border-medisync-purple text-medisync-purple hover:bg-medisync-purple/5"
                    onClick={() => onUpdateStatus(appointment)}
                  >
                    Update Status
                  </Button>
                  <Button 
                    className="bg-medisync-purple hover:bg-medisync-purple-dark text-white"
                    onClick={() => onManageProcesses(appointment)}
                  >
                    Manage Processes
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentManagement;
