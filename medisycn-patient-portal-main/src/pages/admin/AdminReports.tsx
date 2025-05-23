import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, Download, Plus, TrendingUp, Users, Calendar, DollarSign, ListFilter, FileSpreadsheet, Clock } from 'lucide-react';
import { Report, PatientStatistics, DoctorStats, EquipmentStatistics } from '../../types/index';
import Navbar from '@/components/Navbar';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

const AdminReports = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewingReportId, setViewingReportId] = useState<number | null>(null);
  const [showReportsDrawer, setShowReportsDrawer] = useState(false);
  
  // Change back to arrays for simpler state management
  const [selectedPatients, setSelectedPatients] = useState<number[]>([]);
  const [selectedDoctors, setSelectedDoctors] = useState<number[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<number[]>([]);
  
  const { toast } = useToast();

  const { data: reports } = useQuery({
    queryKey: ['adminReports'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8000/api/v1/reports', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch reports');
      }
      return response.json();
    }
  });

  const { data: reportData } = useQuery({
    queryKey: ['reportData', viewingReportId],
    queryFn: async () => {
      if (!viewingReportId) return null;
      const response = await fetch(`http://localhost:8000/api/v1/reports/${viewingReportId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch report data');
      }
      return response.json();
    },
    enabled: !!viewingReportId
  });

  const { data: availablePatients } = useQuery({
    queryKey: ['availablePatients'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8000/api/v1/admin/patients', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch patients');
      }
      return response.json();
    }
  });

  const { data: availableDoctors } = useQuery({
    queryKey: ['availableDoctors'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8000/api/v1/admin/doctors', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch doctors');
      }
      const data = await response.json();
      console.log('Fetched doctors data:', data); // Debug the data structure
      return data;
    }
  });

  const { data: availableEquipment } = useQuery({
    queryKey: ['availableEquipment'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8000/api/v1/admin/resources', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch equipment');
      }
      return response.json();
    }
  });

  const createReportMutation = useMutation({
    mutationFn: async (data: { 
      timeframe: string;
      patient_ids?: number[];
      doctor_ids?: number[];
      equipment_ids?: number[];
    }) => {
      const response = await fetch('http://localhost:8000/api/v1/reports', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          timeframe: data.timeframe,
          patient_ids: selectedPatients.length > 0 ? selectedPatients : undefined,
          doctor_ids: selectedDoctors.length > 0 ? selectedDoctors : undefined,
          equipment_ids: selectedEquipment.length > 0 ? selectedEquipment : undefined
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create report');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Report Created",
        description: "Your report has been generated successfully.",
      });
      setShowCreateDialog(false);
      setViewingReportId(data.reportid);
      setSelectedPatients([]);
      setSelectedDoctors([]);
      setSelectedEquipment([]);
    },
  });

  // Update the data usage in the component
  const patientStats = reportData?.patientStatistics || [];
  const doctorStats = reportData?.doctorStatistics || [];
  const equipmentStats = reportData?.equipmentStatistics || [];

  // Calculate summary metrics
  const totalPatients = patientStats.length;
  const totalAppointments = doctorStats.reduce((sum, doc) => sum + (doc.appointmentcount || 0), 0);
  const totalRevenue = doctorStats.reduce((sum, doc) => sum + (doc.totalrevenue || 0), 0);
  const totalProcesses = patientStats.reduce((sum, patient) => sum + (patient.totalprocesses || 0), 0);

  // Chart data
  const appointmentChartData = doctorStats.map(doc => ({
    name: doc.doctorname,
    appointments: doc.appointmentcount || 0,
    revenue: doc.totalrevenue || 0
  }));

  // Calculate additional metrics for overview
  const topDoctors = [...doctorStats].sort((a, b) => (b.appointmentcount || 0) - (a.appointmentcount || 0)).slice(0, 3);
  const topPatients = [...patientStats].sort((a, b) => (b.totalappointments || 0) - (a.totalappointments || 0)).slice(0, 3);
  const averageRating = doctorStats.reduce((sum, doc) => sum + (doc.ratings || 0), 0) / (doctorStats.length || 1);

  const currentReport = reports?.find(r => r.reportid === viewingReportId) || reports?.[0];

  // Add useEffect to monitor state changes
  useEffect(() => {
    console.log('Selected Patients Changed:', selectedPatients);
  }, [selectedPatients]);

  useEffect(() => {
    console.log('Selected Doctors Changed:', selectedDoctors);
  }, [selectedDoctors]);

  useEffect(() => {
    console.log('Selected Equipment Changed:', selectedEquipment);
  }, [selectedEquipment]);

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <div className="my-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">Reports & Analytics</h1>
          <div className="flex space-x-4">
            {/* Report Selector */}
            <Dialog open={showReportsDrawer} onOpenChange={setShowReportsDrawer}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  {currentReport ? `Viewing: ${currentReport.reportid}` : "Select Report"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Saved Reports</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                  {reports && reports.length > 0 ? (
                      reports.map(report => (
                        <Card 
                          key={report.reportid} 
                          className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                            viewingReportId === report.reportid ? 'border-2 border-primary bg-primary/5' : ''
                          }`}
                          onClick={() => {
                            setViewingReportId(report.reportid);
                            setShowReportsDrawer(false);
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium">Report #{report.reportid}</h3>
                              <p className="text-sm text-gray-500">
                                Created {format(new Date(report.time_stamp), 'MMM d, yyyy')}
                              </p>
                            </div>
                            <FileText className="h-5 w-5 text-gray-400" />
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p>No saved reports found.</p>
                    </div>
                  )}
                </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
            
            <Select value={selectedTimeframe} onValueChange={(value: any) => setSelectedTimeframe(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Report
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Report</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Timeframe</label>
                    <Select value={selectedTimeframe} onValueChange={(value: any) => setSelectedTimeframe(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Select Items to Include</h3>
                    
                    {/* Patients Selection */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Patients</h4>
                      <ScrollArea className="h-32 border rounded-md p-2">
                        <div className="space-y-2">
                          {availablePatients?.map((patient: any) => {
                            console.log('Rendering patient:', patient.patientid, 'Selected:', selectedPatients.includes(patient.patientid));
                            return (
                              <div 
                                key={patient.patientid} 
                                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md"
                              >
                                <input
                                  type="checkbox"
                                  id={`patient-${patient.patientid}`}
                                  checked={selectedPatients.includes(patient.patientid)}
                                  onChange={() => {
                                    console.log('=== PATIENT SELECTION DEBUG ===');
                                    console.log('Current selected patients:', selectedPatients);
                                    console.log('Toggling patient:', patient.patientid);
                                    console.log('Patient name:', patient.name);
                                    setSelectedPatients(current => {
                                      const isSelected = current.includes(patient.patientid);
                                      const newSelection = isSelected 
                                        ? current.filter(id => id !== patient.patientid)
                                        : [...current, patient.patientid];
                                      console.log('New selection will be:', newSelection);
                                      return newSelection;
                                    });
                                  }}
                                  className="h-4 w-4 rounded border-gray-300"
                                />
                                <label 
                                  htmlFor={`patient-${patient.patientid}`} 
                                  className="text-sm flex-1 cursor-pointer"
                                >
                                  {patient.name}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Doctors Selection */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Doctors</h4>
                      <ScrollArea className="h-32 border rounded-md p-2">
                        <div className="space-y-2">
                          {availableDoctors?.map((doctor: any) => {
                            console.log('Rendering doctor:', doctor.employeeid, 'Selected:', selectedDoctors.includes(doctor.employeeid));
                            return (
                              <div 
                                key={doctor.employeeid} 
                                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md"
                              >
                                <input
                                  type="checkbox"
                                  id={`doctor-${doctor.employeeid}`}
                                  checked={selectedDoctors.includes(doctor.employeeid)}
                                  onChange={() => {
                                    console.log('=== DOCTOR SELECTION DEBUG ===');
                                    console.log('Current selected doctors:', selectedDoctors);
                                    console.log('Toggling doctor:', doctor.employeeid);
                                    console.log('Doctor name:', doctor.name);
                                    setSelectedDoctors(current => {
                                      const isSelected = current.includes(doctor.employeeid);
                                      const newSelection = isSelected 
                                        ? current.filter(id => id !== doctor.employeeid)
                                        : [...current, doctor.employeeid];
                                      console.log('New selection will be:', newSelection);
                                      return newSelection;
                                    });
                                  }}
                                  className="h-4 w-4 rounded border-gray-300"
                                />
                                <label 
                                  htmlFor={`doctor-${doctor.employeeid}`} 
                                  className="text-sm flex-1 cursor-pointer"
                                >
                                  Dr. {doctor.name} ({doctor.specialization})
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Equipment Selection */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Equipment</h4>
                      <ScrollArea className="h-32 border rounded-md p-2">
                        <div className="space-y-2">
                          {availableEquipment?.map((equipment: any) => (
                            <div 
                              key={equipment.resourceid} 
                              className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md"
                            >
                              <input
                                type="checkbox"
                                id={`equipment-${equipment.resourceid}`}
                                checked={selectedEquipment.includes(equipment.resourceid)}
                                onChange={() => {
                                  setSelectedEquipment(current => {
                                    const isSelected = current.includes(equipment.resourceid);
                                    if (isSelected) {
                                      return current.filter(id => id !== equipment.resourceid);
                                    } else {
                                      return [...current, equipment.resourceid];
                                    }
                                  });
                                }}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <label 
                                htmlFor={`equipment-${equipment.resourceid}`} 
                                className="text-sm flex-1 cursor-pointer"
                              >
                                {equipment.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => createReportMutation.mutate({ 
                        timeframe: selectedTimeframe,
                        patient_ids: selectedPatients,
                        doctor_ids: selectedDoctors,
                        equipment_ids: selectedEquipment
                      })}
                      disabled={createReportMutation.isPending}
                    >
                      Create Report
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Report Header Information */}
        {currentReport && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h2 className="text-xl font-semibold">{currentReport.reportid}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Generated on {format(new Date(currentReport.time_stamp), 'MMMM d, yyyy')} • {selectedTimeframe} data
                  </p>
                </div>
                <div className="flex space-x-2 mt-4 md:mt-0">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <ListFilter className="h-4 w-4 mr-1" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patientStats.length}</div>
              <p className="text-xs text-muted-foreground">
                Patients in this report
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {doctorStats.reduce((sum, doc) => sum + (doc.appointmentcount || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Appointments in this report
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${doctorStats.reduce((sum, doc) => sum + (doc.totalrevenue || 0), 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Revenue in this report
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {doctorStats.length > 0 
                  ? (doctorStats.reduce((sum, doc) => sum + (doc.ratings || 0), 0) / doctorStats.length).toFixed(1)
                  : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                Average rating in this report
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Top Performers and Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Doctors */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Doctors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topDoctors.map((doctor, index) => (
                  <div key={doctor.doctorid} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{doctor.doctorname}</p>
                        <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{doctor.appointmentcount} appointments</p>
                      <p className="text-sm text-muted-foreground">Rating: {doctor.ratings?.toFixed(1) || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Patients */}
          <Card>
            <CardHeader>
              <CardTitle>Most Active Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPatients.map((patient, index) => (
                  <div key={patient.patientid} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{patient.patientname}</p>
                        <p className="text-sm text-muted-foreground">
                          Last visit: {patient.lastvisit ? new Date(patient.lastvisit).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{patient.totalappointments} appointments</p>
                      <p className="text-sm text-muted-foreground">{patient.totalprocesses} processes</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Doctor Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Doctor Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={appointmentChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="appointments" fill="#8884d8" name="Appointments" />
                <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tabbed Reports */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
          </TabsList>

          <TabsContent value="doctors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Doctor Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-4 px-2">Doctor</th>
                        <th className="text-left py-4 px-2">Appointments</th>
                        <th className="text-left py-4 px-2">Prescriptions</th>
                        <th className="text-left py-4 px-2">Revenue</th>
                        <th className="text-left py-4 px-2">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctorStats?.map((doctor) => (
                        <tr key={doctor.doctorid} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-2">Dr. {doctor.doctorname}</td>
                          <td className="py-4 px-2">{doctor.appointmentcount || 0}</td>
                          <td className="py-4 px-2">{doctor.prescriptioncount || 0}</td>
                          <td className="py-4 px-2">${(doctor.totalrevenue || 0).toLocaleString()}</td>
                          <td className="py-4 px-2">
                            <Badge variant="secondary">{(doctor.ratings || 0).toFixed(1)}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-4 px-2">Patient</th>
                        <th className="text-left py-4 px-2">Appointments</th>
                        <th className="text-left py-4 px-2">Processes</th>
                        <th className="text-left py-4 px-2">Total Paid</th>
                        <th className="text-left py-4 px-2">Last Visit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patientStats?.map((patient) => (
                        <tr key={patient.patientid} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-2">{patient.patientname}</td>
                          <td className="py-4 px-2">{patient.totalappointments || 0}</td>
                          <td className="py-4 px-2">{patient.totalprocesses || 0}</td>
                          <td className="py-4 px-2">${(patient.totalpaid || 0).toLocaleString()}</td>
                          <td className="py-4 px-2">{patient.lastvisit ? new Date(patient.lastvisit).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-4 px-2">Resource</th>
                        <th className="text-left py-4 px-2">Usage Count</th>
                        <th className="text-left py-4 px-2">Total Requests</th>
                        <th className="text-left py-4 px-2">Last Used</th>
                        <th className="text-left py-4 px-2">Utilization</th>
                      </tr>
                    </thead>
                    <tbody>
                      {equipmentStats?.map((equipment) => (
                        <tr key={equipment.resourceid} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-2">Resource {equipment.resourceid}</td>
                          <td className="py-4 px-2">{equipment.usagecount || 0}</td>
                          <td className="py-4 px-2">{equipment.totalrequests || 0}</td>
                          <td className="py-4 px-2">{equipment.lastuseddate ? new Date(equipment.lastuseddate).toLocaleDateString() : 'N/A'}</td>
                          <td className="py-4 px-2">
                            <Badge variant={equipment.usagecount > 100 ? "default" : "secondary"}>
                              {((equipment.usagecount || 0) / (equipment.totalrequests || 1) * 100).toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminReports;