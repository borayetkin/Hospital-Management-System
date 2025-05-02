
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileText, DollarSign, User, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { Process, Doctor, Billing, Patient } from '@/types';

const ProcessStatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <Badge variant="outline" className={getStatusColor(status)}>
      {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
    </Badge>
  );
};

const BillingStatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'overdue':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <Badge variant="outline" className={getStatusColor(status)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const PaymentDialog = ({ 
  process, 
  billing, 
  onPaymentComplete 
}: { 
  process: Process, 
  billing?: Billing, 
  onPaymentComplete: () => void 
}) => {
  const { user, updateUserBalance } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  if (!user || user.role !== 'patient') return null;
  const patient = user as Patient;
  
  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Check if patient has enough balance
      if (patient.balance < process.price) {
        toast.error('Insufficient balance. Please add funds to your account.');
        return;
      }
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update billing status in backend (simulated)
      if (billing) {
        await dataService.updateBillingStatus(billing.id, 'paid');
      }
      
      // Update patient balance
      if (updateUserBalance) {
        updateUserBalance(-process.price);
      }
      
      // Success message
      toast.success(`Payment of $${process.price} processed successfully!`);
      onPaymentComplete();
      setIsOpen(false);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          variant="outline" 
          disabled={billing?.status === 'paid'}
          className="flex gap-1 items-center"
        >
          <DollarSign className="h-4 w-4" />
          {billing?.status === 'paid' ? 'Paid' : 'Pay Now'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
          <DialogDescription>
            Review and complete payment for this medical process.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Process:</span>
            <span>{process.name}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Date:</span>
            <span>{format(new Date(process.date), 'MMM dd, yyyy')}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Amount:</span>
            <span className="font-bold">${process.price}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Your Balance:</span>
            <span className={patient.balance < process.price ? 'text-red-500 font-bold' : 'font-bold'}>
              ${patient.balance}
            </span>
          </div>
          
          {patient.balance < process.price && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Insufficient Balance</AlertTitle>
              <AlertDescription>
                You don't have enough funds to complete this payment. Please add funds in your account settings.
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button 
            disabled={patient.balance < process.price || isProcessing} 
            onClick={handlePayment}
          >
            {isProcessing ? 'Processing...' : 'Complete Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const PatientProcesses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [billingMap, setBillingMap] = useState<Map<string, Billing>>(new Map());
  const [doctorMap, setDoctorMap] = useState<Map<string, Doctor>>(new Map());
  const [appointmentMap, setAppointmentMap] = useState<Map<string, { doctorName: string, date: string }>>
    (new Map());

  useEffect(() => {
    if (!user || user.role !== 'patient') {
      navigate('/login');
      return;
    }

    const fetchProcessesData = async () => {
      setLoading(true);
      try {
        // Fetch patient's processes
        const processesData = await dataService.getPatientProcesses(user.id);
        setProcesses(processesData);
        
        // Fetch associated doctors
        const doctorsData = await dataService.getPatientDoctors(user.id);
        setDoctors(doctorsData);
        
        const doctorMapping = new Map<string, Doctor>();
        doctorsData.forEach(doctor => {
          doctorMapping.set(doctor.id, doctor);
        });
        setDoctorMap(doctorMapping);
        
        // Fetch billing info for each process
        const billingMapping = new Map<string, Billing>();
        for (const process of processesData) {
          const billing = await dataService.getProcessBilling(process.id);
          if (billing) {
            billingMapping.set(process.id, billing);
          }
        }
        setBillingMap(billingMapping);
        
        // Fetch appointments to associate processes with doctors
        const appointmentMapping = new Map<string, { doctorName: string, date: string }>();
        for (const process of processesData) {
          const appointments = await dataService.getPatientAppointments(user.id);
          const appointment = appointments.find(app => app.id === process.appointmentId);
          
          if (appointment) {
            const doctor = doctorMapping.get(appointment.doctorId);
            if (doctor) {
              appointmentMapping.set(process.id, {
                doctorName: doctor.name,
                date: appointment.date
              });
            }
          }
        }
        setAppointmentMap(appointmentMapping);
        
      } catch (error) {
        console.error('Error fetching processes data:', error);
        toast.error('Failed to load processes data');
      } finally {
        setLoading(false);
      }
    };

    fetchProcessesData();
  }, [user, navigate]);

  const handlePaymentComplete = async () => {
    // Refresh billing data after payment
    if (!user) return;
    
    try {
      const processesData = await dataService.getPatientProcesses(user.id);
      
      // Update billing info for each process
      const billingMapping = new Map<string, Billing>();
      for (const process of processesData) {
        const billing = await dataService.getProcessBilling(process.id);
        if (billing) {
          billingMapping.set(process.id, billing);
        }
      }
      setBillingMap(billingMapping);
      
      toast.success('Data refreshed after payment');
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  // Group processes by status
  const upcomingProcesses = processes.filter(p => p.status === 'scheduled' || p.status === 'in_progress');
  const completedProcesses = processes.filter(p => p.status === 'completed');
  const cancelledProcesses = processes.filter(p => p.status === 'cancelled');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Medical Processes</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Doctors</CardTitle>
          <CardDescription>Healthcare providers you've visited</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-48">
                  <Skeleton className="h-12 w-12 rounded-full mb-2" />
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">You haven't visited any doctors yet.</p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {doctors.map(doctor => (
                <div key={doctor.id} className="flex-shrink-0 w-48 p-3 border rounded-md">
                  <div className="font-medium">{doctor.name}</div>
                  <div className="text-sm text-muted-foreground">{doctor.specialization}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Rating: {doctor.rating} ⭐
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="upcoming">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming ({upcomingProcesses.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedProcesses.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledProcesses.length})</TabsTrigger>
        </TabsList>
        
        {['upcoming', 'completed', 'cancelled'].map((tab) => {
          const processesToShow = tab === 'upcoming' 
            ? upcomingProcesses 
            : tab === 'completed' 
              ? completedProcesses 
              : cancelledProcesses;
              
          return (
            <TabsContent key={tab} value={tab} className="mt-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-5 w-40" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : processesToShow.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/10">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <h3 className="text-lg font-medium mb-2">
                    No {tab} processes found
                  </h3>
                  <p className="text-muted-foreground">
                    {tab === 'upcoming' 
                      ? "You don't have any upcoming medical processes scheduled."
                      : tab === 'completed'
                        ? "You don't have any completed medical processes yet."
                        : "You don't have any cancelled medical processes."}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Process</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Billing</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processesToShow.map((process) => {
                      const billing = billingMap.get(process.id);
                      const appointmentInfo = appointmentMap.get(process.id);
                      
                      return (
                        <TableRow key={process.id}>
                          <TableCell>
                            <div className="font-medium">{process.name}</div>
                            <div className="text-sm text-muted-foreground">{process.description}</div>
                          </TableCell>
                          <TableCell>
                            {appointmentInfo?.doctorName || 'Unknown Doctor'}
                          </TableCell>
                          <TableCell>
                            {process.date ? format(new Date(process.date), 'MMM dd, yyyy') : 'Not scheduled'}
                          </TableCell>
                          <TableCell>
                            <ProcessStatusBadge status={process.status} />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <div className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />
                                <span>${process.price}</span>
                              </div>
                              {billing && (
                                <div className="mt-1">
                                  <BillingStatusBadge status={billing.status} />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {user?.role === 'patient' && process.status === 'completed' && (
                              <PaymentDialog 
                                process={process} 
                                billing={billing} 
                                onPaymentComplete={handlePaymentComplete} 
                              />
                            )}
                            {billing?.status === 'paid' && (
                              <div className="flex items-center text-green-600 text-sm">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                <span>Paid</span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default PatientProcesses;
