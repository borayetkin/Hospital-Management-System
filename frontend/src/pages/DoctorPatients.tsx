
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  Activity, 
  DollarSign, 
  FileText,
  FilePlus,
  ClipboardCheck
} from 'lucide-react';
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { Patient, Process } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

const PatientCard = ({ 
  patient, 
  onViewDetails 
}: { 
  patient: Patient, 
  onViewDetails: (patient: Patient) => void 
}) => {
  return (
    <Card className="card-hover cursor-pointer" onClick={() => onViewDetails(patient)}>
      <CardHeader className="flex flex-row items-start gap-4 pb-2">
        <Avatar>
          <AvatarImage src={patient.avatar} />
          <AvatarFallback>{getInitials(patient.name)}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <CardTitle className="text-lg">{patient.name}</CardTitle>
          <CardDescription>Patient</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center gap-1.5">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{patient.phoneNumber}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{patient.email}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" onClick={(e) => {
          e.stopPropagation();
          onViewDetails(patient);
        }}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

const ProcessStatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in_progress':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
    </span>
  );
};

const DoctorPatients = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientProcesses, setPatientProcesses] = useState<Process[]>([]);
  const [loadingProcesses, setLoadingProcesses] = useState(false);
  const [showAddProcessDialog, setShowAddProcessDialog] = useState(false);
  const [newProcess, setNewProcess] = useState({
    name: '',
    description: '',
    price: '',
  });
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('');
  const [appointmentOptions, setAppointmentOptions] = useState<{ id: string; date: string }[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'doctor') {
      navigate('/login');
      return;
    }

    const fetchPatients = async () => {
      setLoading(true);
      try {
        const patientsData = await dataService.getDoctorPatients(user.id);
        setPatients(patientsData);
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast.error('Failed to load patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [user, navigate]);

  const handleViewPatientDetails = async (patient: Patient) => {
    setSelectedPatient(patient);
    setLoadingProcesses(true);
    
    try {
      // Fetch processes for this patient with the current doctor
      const processes = await dataService.getDoctorPatientProcesses(user!.id, patient.id);
      setPatientProcesses(processes);
      
      // Fetch appointments for process creation dropdown
      const appointments = await dataService.getDoctorAppointments(user!.id);
      const patientAppointments = appointments.filter(app => app.patientId === patient.id);
      
      setAppointmentOptions(patientAppointments.map(app => ({
        id: app.id,
        date: `${app.date} (${app.startTime})`
      })));
      
      if (patientAppointments.length > 0) {
        setSelectedAppointmentId(patientAppointments[0].id);
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
      toast.error('Failed to load patient details');
    } finally {
      setLoadingProcesses(false);
    }
  };

  const handleAddProcess = async () => {
    if (!newProcess.name || !newProcess.description || !newProcess.price || !selectedAppointmentId) {
      toast.error('Please fill all fields');
      return;
    }
    
    try {
      await dataService.addProcess(
        selectedAppointmentId,
        newProcess.name,
        newProcess.description,
        parseFloat(newProcess.price)
      );
      
      // Refresh processes
      const processes = await dataService.getDoctorPatientProcesses(user!.id, selectedPatient!.id);
      setPatientProcesses(processes);
      
      // Reset form
      setNewProcess({
        name: '',
        description: '',
        price: '',
      });
      
      setShowAddProcessDialog(false);
      toast.success('Process added successfully');
    } catch (error) {
      console.error('Error adding process:', error);
      toast.error('Failed to add process');
    }
  };

  const handleUpdateProcessStatus = async (processId: string, newStatus: 'scheduled' | 'in_progress' | 'completed' | 'cancelled') => {
    try {
      await dataService.updateProcessStatus(processId, newStatus);
      
      // Refresh processes
      const processes = await dataService.getDoctorPatientProcesses(user!.id, selectedPatient!.id);
      setPatientProcesses(processes);
      
      toast.success(`Process status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating process status:', error);
      toast.error('Failed to update process status');
    }
  };

  const getStatusOptions = (currentStatus: string) => {
    const allStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];
    return allStatuses.filter(status => status !== currentStatus);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Patients</h1>
      </div>

      {selectedPatient ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setSelectedPatient(null)}>
              Back to All Patients
            </Button>
            <Button onClick={() => setShowAddProcessDialog(true)}>
              <FilePlus className="h-4 w-4 mr-2" />
              Add New Process
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedPatient.avatar} />
                  <AvatarFallback>{getInitials(selectedPatient.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{selectedPatient.name}</CardTitle>
                  <CardDescription>Patient Profile</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Contact Information</div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedPatient.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedPatient.phoneNumber}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Financial Information</div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>Balance: ${selectedPatient.balance}</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Medical Processes</h3>
                {loadingProcesses ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : patientProcesses.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg bg-muted/10">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <h3 className="text-lg font-medium">No processes found</h3>
                    <p className="text-muted-foreground">This patient doesn't have any medical processes recorded yet.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Process Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patientProcesses.map((process) => (
                        <TableRow key={process.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div>{process.name}</div>
                              <div className="text-xs text-muted-foreground mt-1">{process.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>{format(new Date(process.date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>${process.price}</TableCell>
                          <TableCell>
                            <ProcessStatusBadge status={process.status} />
                          </TableCell>
                          <TableCell>
                            {process.status !== 'completed' && process.status !== 'cancelled' && (
                              <div className="flex gap-2">
                                {getStatusOptions(process.status).map(status => (
                                  <Button 
                                    key={status}
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleUpdateProcessStatus(process.id, status as any)}
                                  >
                                    {status === 'completed' && <ClipboardCheck className="h-3 w-3 mr-1" />}
                                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [...Array(3)].map((_, i) => (
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
            ))
          ) : patients.length === 0 ? (
            <div className="col-span-full text-center py-12 border rounded-lg bg-muted/10">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <h3 className="text-lg font-medium mb-2">No patients found</h3>
              <p className="text-muted-foreground">You don't have any patients assigned to you yet.</p>
            </div>
          ) : (
            patients.map(patient => (
              <PatientCard 
                key={patient.id}
                patient={patient}
                onViewDetails={handleViewPatientDetails}
              />
            ))
          )}
        </div>
      )}
      
      {/* Add Process Dialog */}
      <Dialog open={showAddProcessDialog} onOpenChange={setShowAddProcessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Medical Process</DialogTitle>
            <DialogDescription>
              Create a new medical process for this patient.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="appointment" className="text-sm font-medium">
                Select Appointment
              </label>
              <select 
                id="appointment"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedAppointmentId}
                onChange={(e) => setSelectedAppointmentId(e.target.value)}
              >
                {appointmentOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.date}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="processName" className="text-sm font-medium">
                Process Name
              </label>
              <Input
                id="processName"
                placeholder="e.g., Blood Test, X-Ray, Physical Examination"
                value={newProcess.name}
                onChange={(e) => setNewProcess({...newProcess, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="processDescription" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="processDescription"
                placeholder="Describe the medical process..."
                value={newProcess.description}
                onChange={(e) => setNewProcess({...newProcess, description: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="processPrice" className="text-sm font-medium">
                Price ($)
              </label>
              <Input
                id="processPrice"
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={newProcess.price}
                onChange={(e) => setNewProcess({...newProcess, price: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddProcess}>Add Process</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorPatients;
