
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, Calendar, Users, DollarSign, Activity, AlertTriangle, FileText, Save } from 'lucide-react';
import { doctorService } from '@/services/doctorService';
import { appointmentService } from '@/services/appointmentService';
import { patientService } from '@/services/patientService';
import { Doctor, DoctorStatistics, PatientStatistics } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';

interface EquipmentStatistics {
  resourceId: string;
  resourceName: string;
  usageCount: number;
  lastUsedDate: string;
  totalRequests: number;
}

interface Report {
  id: string;
  createdBy: string;
  timestamp: string;
}

const AdminReports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [doctorStats, setDoctorStats] = useState<DoctorStatistics[]>([]);
  const [patientStats, setPatientStats] = useState<PatientStatistics[]>([]);
  const [equipmentStats, setEquipmentStats] = useState<EquipmentStatistics[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [topDoctors, setTopDoctors] = useState<{ name: string; appointmentCount: number }[]>([]);
  const [appointmentTrends, setAppointmentTrends] = useState<{ date: string; count: number }[]>([]);
  const [revenueData, setRevenueData] = useState<{ category: string; amount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Selection states for generating reports
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [allPatients, setAllPatients] = useState<{id: string, name: string}[]>([]);
  const [allEquipment, setAllEquipment] = useState<{id: string, name: string}[]>([]);
  const [isSelectionDialogOpen, setIsSelectionDialogOpen] = useState(false);

  useEffect(() => {
    // Only admin users can access this page
    if (!user || user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!user || user.role !== 'admin') return;
      
      setLoading(true);
      try {
        // Simulate data fetch delays
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock reports
        const mockReports: Report[] = [
          { id: '1', createdBy: user.name, timestamp: new Date().toISOString() },
          { id: '2', createdBy: user.name, timestamp: new Date(Date.now() - 86400000).toISOString() }, // yesterday
          { id: '3', createdBy: 'Another Admin', timestamp: new Date(Date.now() - 86400000 * 7).toISOString() }, // week ago
        ];
        setReports(mockReports);
        setSelectedReport(mockReports[0].id);
        
        // Get all doctors for selection
        const doctors = await doctorService.getDoctors();
        setAllDoctors(doctors);
        
        // Mock patient data for selection
        const mockPatients = Array(8).fill(null).map((_, index) => ({
          id: `patient-${index + 1}`,
          name: `Patient ${index + 1}`,
        }));
        setAllPatients(mockPatients);
        
        // Mock equipment data for selection
        const mockEquipment = [
          {id: 'resource-1', name: 'MRI Scanner'},
          {id: 'resource-2', name: 'X-Ray Machine'},
          {id: 'resource-3', name: 'Ultrasound'},
          {id: 'resource-4', name: 'ECG Machine'},
          {id: 'resource-5', name: 'Ventilator'},
          {id: 'resource-6', name: 'Blood Analyzer'}
        ];
        setAllEquipment(mockEquipment);
        
        // Mock doctor statistics - matching the schema
        const mockDoctorStats: DoctorStatistics[] = doctors.map(doctor => ({
          doctorId: doctor.id,
          appointmentCount: Math.floor(Math.random() * 100) + 20,
          completedAppointments: Math.floor(Math.random() * 80) + 10,
          cancelledAppointments: Math.floor(Math.random() * 10),
          averageRating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
          totalRevenue: Math.floor(Math.random() * 10000) + 2000,
          period: timeframe,
          prescriptionCount: Math.floor(Math.random() * 50) + 10,
          reportDate: new Date().toISOString().split('T')[0],
        }));
        
        setDoctorStats(mockDoctorStats);
        
        // Mock patient statistics - matching the schema
        const mockPatientStats: PatientStatistics[] = Array(10).fill(null).map((_, index) => ({
          patientId: `patient-${index + 1}`,
          totalAppointments: Math.floor(Math.random() * 20) + 1,
          totalProcesses: Math.floor(Math.random() * 10) + 1,
          totalPaid: parseFloat((Math.random() * 2000 + 500).toFixed(2)),
          lastVisit: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString().split('T')[0],
          reportDate: new Date().toISOString().split('T')[0],
        }));
        
        setPatientStats(mockPatientStats);
        
        // Mock equipment statistics - matching the schema
        const mockEquipmentStats: EquipmentStatistics[] = Array(6).fill(null).map((_, index) => ({
          resourceId: `resource-${index + 1}`,
          resourceName: [`MRI Scanner`, `X-Ray Machine`, `Ultrasound`, `ECG Machine`, `Ventilator`, `Blood Analyzer`][index],
          usageCount: Math.floor(Math.random() * 200) + 50,
          lastUsedDate: new Date(Date.now() - Math.random() * 10 * 86400000).toISOString().split('T')[0],
          totalRequests: Math.floor(Math.random() * 300) + 100,
        }));
        
        setEquipmentStats(mockEquipmentStats);
        
        // Generate top doctors data
        const topDocs = doctors.slice(0, 5).map((doctor, index) => ({
          name: doctor.name,
          appointmentCount: 100 - index * 15
        }));
        setTopDoctors(topDocs);
        
        // Generate appointment trends data
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const trendData = months.map(month => ({
          date: month,
          count: Math.floor(Math.random() * 50) + 30
        }));
        setAppointmentTrends(trendData);
        
        // Generate revenue data
        setRevenueData([
          { category: 'Appointments', amount: 45000 },
          { category: 'Tests', amount: 30000 },
          { category: 'Procedures', amount: 65000 },
          { category: 'Prescriptions', amount: 25000 }
        ]);
        
      } catch (error) {
        console.error('Error fetching report data:', error);
        toast.error('Failed to load report data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, [timeframe, user]);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a new report with a unique ID and current timestamp
      const newReport: Report = {
        id: `report-${Date.now()}`, // Use timestamp for unique ID
        createdBy: user?.name || 'Admin',
        timestamp: new Date().toISOString()
      };
      
      // Add the new report to the list at the beginning
      setReports(prevReports => [newReport, ...prevReports]);
      
      // Select the newly created report
      setSelectedReport(newReport.id);
      
      toast.success("Report generated successfully", {
        description: `Report #${newReport.id} has been created with ${selectedDoctors.length} doctors, ${selectedPatients.length} patients, and ${selectedEquipment.length} equipment items.`
      });
      
      // Reset selections and close dialog
      setIsSelectionDialogOpen(false);
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report", {
        description: "An error occurred while generating the report."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenReportDialog = () => {
    setIsSelectionDialogOpen(true);
  };

  const handleToggleDoctor = (doctorId: string) => {
    setSelectedDoctors(prev => 
      prev.includes(doctorId) 
        ? prev.filter(id => id !== doctorId) 
        : [...prev, doctorId]
    );
  };

  const handleTogglePatient = (patientId: string) => {
    setSelectedPatients(prev => 
      prev.includes(patientId) 
        ? prev.filter(id => id !== patientId) 
        : [...prev, patientId]
    );
  };

  const handleToggleEquipment = (equipmentId: string) => {
    setSelectedEquipment(prev => 
      prev.includes(equipmentId) 
        ? prev.filter(id => id !== equipmentId) 
        : [...prev, equipmentId]
    );
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Reports & Analytics</h1>
        
        <div className="flex gap-4">
          <Select value={selectedReport || ''} onValueChange={(value) => setSelectedReport(value)}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Select report" />
            </SelectTrigger>
            <SelectContent>
              {reports.map(report => (
                <SelectItem key={report.id} value={report.id}>
                  Report #{report.id} - {new Date(report.timestamp).toLocaleDateString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={timeframe} onValueChange={(value) => setTimeframe(value as 'weekly' | 'monthly' | 'yearly')}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isSelectionDialogOpen} onOpenChange={setIsSelectionDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={handleOpenReportDialog}
                className="flex items-center gap-2"
                variant="success"
              >
                <Save className="h-4 w-4" />
                Save & Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[80%] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Generate New Report</DialogTitle>
                <DialogDescription>
                  Select doctors, patients, and equipment to include in your report.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Doctors</h3>
                  <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                    {allDoctors.map(doctor => (
                      <div key={doctor.id} className="flex items-center space-x-2 py-2 border-b">
                        <Checkbox 
                          id={`doctor-${doctor.id}`} 
                          checked={selectedDoctors.includes(doctor.id)}
                          onCheckedChange={() => handleToggleDoctor(doctor.id)}
                        />
                        <label htmlFor={`doctor-${doctor.id}`} className="text-sm cursor-pointer">
                          {doctor.name} - {doctor.specialization}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Patients</h3>
                  <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                    {allPatients.map(patient => (
                      <div key={patient.id} className="flex items-center space-x-2 py-2 border-b">
                        <Checkbox 
                          id={`patient-${patient.id}`} 
                          checked={selectedPatients.includes(patient.id)}
                          onCheckedChange={() => handleTogglePatient(patient.id)}
                        />
                        <label htmlFor={`patient-${patient.id}`} className="text-sm cursor-pointer">
                          {patient.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Equipment</h3>
                  <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                    {allEquipment.map(equipment => (
                      <div key={equipment.id} className="flex items-center space-x-2 py-2 border-b">
                        <Checkbox 
                          id={`equipment-${equipment.id}`} 
                          checked={selectedEquipment.includes(equipment.id)}
                          onCheckedChange={() => handleToggleEquipment(equipment.id)}
                        />
                        <label htmlFor={`equipment-${equipment.id}`} className="text-sm cursor-pointer">
                          {equipment.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button onClick={() => setIsSelectionDialogOpen(false)} variant="outline">Cancel</Button>
                <Button 
                  onClick={handleGenerateReport} 
                  disabled={isGenerating}
                  variant="success"
                >
                  {isGenerating ? "Generating..." : "Generate Report"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">1,245</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">+12% from last {timeframe}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">468</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">+5% from last {timeframe}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">$165,420</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">+15% from last {timeframe}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Medical Processes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">789</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">+8% from last {timeframe}</p>
          </CardContent>
        </Card>
      </div>
      
      <Alert className="mb-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Demo Mode</AlertTitle>
        <AlertDescription>
          This page displays simulated data for demonstration purposes.
          {isGenerating && " Generating a new report..."}
        </AlertDescription>
      </Alert>

      
      <Tabs defaultValue="doctors">
        <TabsList className="mb-6">
          <TabsTrigger value="doctors" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Doctor Statistics</span>
          </TabsTrigger>
          <TabsTrigger value="patients" className="flex items-center gap-1">
            <LineChartIcon className="h-4 w-4" />
            <span>Patient Statistics</span>
          </TabsTrigger>
          <TabsTrigger value="equipment" className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            <span>Equipment Statistics</span>
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-1">
            <PieChartIcon className="h-4 w-4" />
            <span>Revenue Breakdown</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="doctors">
          
          <Card>
            <CardHeader>
              <CardTitle>Doctor Statistics</CardTitle>
              <CardDescription>
                Performance metrics by doctor
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Doctor ID</TableHead>
                        <TableHead>Appointments</TableHead>
                        <TableHead>Prescriptions</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Report Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {doctorStats.slice(0, 5).map((stat) => (
                        <TableRow key={stat.doctorId}>
                          <TableCell className="font-medium">{stat.doctorId}</TableCell>
                          <TableCell>{stat.appointmentCount}</TableCell>
                          <TableCell>{stat.prescriptionCount}</TableCell>
                          <TableCell>${stat.totalRevenue.toLocaleString()}</TableCell>
                          <TableCell>{stat.averageRating}</TableCell>
                          <TableCell>{stat.reportDate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="patients">
          
          <Card>
            <CardHeader>
              <CardTitle>Patient Statistics</CardTitle>
              <CardDescription>
                Patient activity metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient ID</TableHead>
                        <TableHead>Total Appointments</TableHead>
                        <TableHead>Total Processes</TableHead>
                        <TableHead>Total Paid</TableHead>
                        <TableHead>Last Visit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patientStats.slice(0, 5).map((stat) => (
                        <TableRow key={stat.patientId}>
                          <TableCell className="font-medium">{stat.patientId}</TableCell>
                          <TableCell>{stat.totalAppointments}</TableCell>
                          <TableCell>{stat.totalProcesses}</TableCell>
                          <TableCell>${stat.totalPaid.toLocaleString()}</TableCell>
                          <TableCell>{stat.lastVisit}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment">
          
          <Card>
            <CardHeader>
              <CardTitle>Equipment Statistics</CardTitle>
              <CardDescription>
                Medical resources usage metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Resource Name</TableHead>
                        <TableHead>Usage Count</TableHead>
                        <TableHead>Total Requests</TableHead>
                        <TableHead>Last Used</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {equipmentStats.map((stat) => (
                        <TableRow key={stat.resourceId}>
                          <TableCell className="font-medium">{stat.resourceName}</TableCell>
                          <TableCell>{stat.usageCount}</TableCell>
                          <TableCell>{stat.totalRequests}</TableCell>
                          <TableCell>{stat.lastUsedDate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="revenue">
          
          <Card>
            <CardHeader>
              <CardTitle>Revenue Sources</CardTitle>
              <CardDescription>
                Revenue breakdown by category
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="h-80 w-full max-w-lg">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="amount"
                      nameKey="category"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {revenueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminReports;
