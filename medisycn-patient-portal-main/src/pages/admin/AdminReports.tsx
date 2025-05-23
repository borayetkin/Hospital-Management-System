import React, { useState } from 'react';
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
import { FileText, Download, Plus, TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';
import { Report, PatientStatistics, DoctorStats, EquipmentStatistics } from '../../types/index';
import Navbar from '@/components/Navbar';

const AdminReports = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [reportName, setReportName] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { toast } = useToast();

  // Mock data based on your database schema
  const mockReports: Report[] = [
    {
      reportID: 1,
      created_by: 1,
      time_stamp: new Date().toISOString()
    }
  ];

  const mockPatientStats: PatientStatistics[] = [
    {
      reportID: 1,
      statID: 1,
      patientID: 1,
      totalAppointments: 15,
      totalProcesses: 12,
      totalPaid: 2500.00,
      lastVisit: '2024-01-10',
      reportDate: '2024-01-15'
    },
    {
      reportID: 1,
      statID: 2,
      patientID: 2,
      totalAppointments: 8,
      totalProcesses: 6,
      totalPaid: 1200.00,
      lastVisit: '2024-01-12',
      reportDate: '2024-01-15'
    }
  ];

  const mockDoctorStats: DoctorStats[] = [
    {
      reportID: 1,
      statID: 1,
      doctorID: 101,
      prescriptionCount: 45,
      appointmentCount: 50,
      totalRevenue: 15000.00,
      reportDate: '2024-01-15',
      ratings: 4.8
    },
    {
      reportID: 1,
      statID: 2,
      doctorID: 102,
      prescriptionCount: 38,
      appointmentCount: 42,
      totalRevenue: 12600.00,
      reportDate: '2024-01-15',
      ratings: 4.6
    }
  ];

  const mockEquipmentStats: EquipmentStatistics[] = [
    {
      statID: 1,
      reportID: 1,
      resourceID: 1,
      usageCount: 125,
      lastUsedDate: '2024-01-14',
      totalRequests: 150
    },
    {
      statID: 2,
      reportID: 1,
      resourceID: 2,
      usageCount: 89,
      lastUsedDate: '2024-01-13',
      totalRequests: 95
    }
  ];

  const { data: reports } = useQuery({
    queryKey: ['adminReports'],
    queryFn: () => Promise.resolve(mockReports),
  });

  const { data: patientStats } = useQuery({
    queryKey: ['patientStatistics', selectedTimeframe],
    queryFn: () => Promise.resolve(mockPatientStats),
  });

  const { data: doctorStats } = useQuery({
    queryKey: ['doctorStatistics', selectedTimeframe],
    queryFn: () => Promise.resolve(mockDoctorStats),
  });

  const { data: equipmentStats } = useQuery({
    queryKey: ['equipmentStatistics', selectedTimeframe],
    queryFn: () => Promise.resolve(mockEquipmentStats),
  });

  const createReportMutation = useMutation({
    mutationFn: async (data: { name: string; timeframe: string }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { reportID: Date.now(), success: true };
    },
    onSuccess: () => {
      toast({
        title: "Report Created",
        description: "Your report has been generated successfully.",
      });
      setShowCreateDialog(false);
      setReportName('');
    },
  });

  const handleCreateReport = () => {
    createReportMutation.mutate({
      name: reportName,
      timeframe: selectedTimeframe
    });
  };

  // Calculate summary metrics
  const totalPatients = patientStats?.length || 0;
  const totalAppointments = doctorStats?.reduce((sum, doc) => sum + doc.appointmentCount, 0) || 0;
  const totalRevenue = doctorStats?.reduce((sum, doc) => sum + doc.totalRevenue, 0) || 0;
  const totalProcesses = patientStats?.reduce((sum, patient) => sum + patient.totalProcesses, 0) || 0;

  // Chart data
  const appointmentChartData = doctorStats?.map(doc => ({
    name: `Doctor ${doc.doctorID}`,
    appointments: doc.appointmentCount,
    revenue: doc.totalRevenue
  })) || [];

  const revenueData = [
    { name: 'Appointments', value: totalRevenue * 0.6 },
    { name: 'Procedures', value: totalRevenue * 0.25 },
    { name: 'Equipment', value: totalRevenue * 0.10 },
    { name: 'Other', value: totalRevenue * 0.05 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <div className="my-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">Reports & Analytics</h1>
          <div className="flex space-x-4">
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
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Report</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Report Name</label>
                    <Input
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                      placeholder="Enter report name..."
                    />
                  </div>
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
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateReport}
                      disabled={!reportName.trim() || createReportMutation.isPending}
                    >
                      Create Report
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPatients}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last {selectedTimeframe.slice(0, -2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAppointments}</div>
              <p className="text-xs text-muted-foreground">
                +8% from last {selectedTimeframe.slice(0, -2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +15% from last {selectedTimeframe.slice(0, -2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Medical Processes</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProcesses}</div>
              <p className="text-xs text-muted-foreground">
                +5% from last {selectedTimeframe.slice(0, -2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Reports */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Doctor Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={appointmentChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="appointments" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={revenueData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        {revenueData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

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
                        <th className="text-left py-4 px-2">Doctor ID</th>
                        <th className="text-left py-4 px-2">Appointments</th>
                        <th className="text-left py-4 px-2">Prescriptions</th>
                        <th className="text-left py-4 px-2">Revenue</th>
                        <th className="text-left py-4 px-2">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctorStats?.map((doctor) => (
                        <tr key={doctor.doctorID} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-2">Dr. {doctor.doctorID}</td>
                          <td className="py-4 px-2">{doctor.appointmentCount}</td>
                          <td className="py-4 px-2">{doctor.prescriptionCount}</td>
                          <td className="py-4 px-2">${doctor.totalRevenue.toLocaleString()}</td>
                          <td className="py-4 px-2">
                            <Badge variant="secondary">{doctor.ratings.toFixed(1)}</Badge>
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
                        <th className="text-left py-4 px-2">Patient ID</th>
                        <th className="text-left py-4 px-2">Appointments</th>
                        <th className="text-left py-4 px-2">Processes</th>
                        <th className="text-left py-4 px-2">Total Paid</th>
                        <th className="text-left py-4 px-2">Last Visit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patientStats?.map((patient) => (
                        <tr key={patient.patientID} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-2">{patient.patientID}</td>
                          <td className="py-4 px-2">{patient.totalAppointments}</td>
                          <td className="py-4 px-2">{patient.totalProcesses}</td>
                          <td className="py-4 px-2">${patient.totalPaid.toLocaleString()}</td>
                          <td className="py-4 px-2">{new Date(patient.lastVisit).toLocaleDateString()}</td>
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
                        <th className="text-left py-4 px-2">Resource ID</th>
                        <th className="text-left py-4 px-2">Usage Count</th>
                        <th className="text-left py-4 px-2">Total Requests</th>
                        <th className="text-left py-4 px-2">Last Used</th>
                        <th className="text-left py-4 px-2">Utilization</th>
                      </tr>
                    </thead>
                    <tbody>
                      {equipmentStats?.map((equipment) => (
                        <tr key={equipment.resourceID} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-2">Resource {equipment.resourceID}</td>
                          <td className="py-4 px-2">{equipment.usageCount}</td>
                          <td className="py-4 px-2">{equipment.totalRequests}</td>
                          <td className="py-4 px-2">{new Date(equipment.lastUsedDate).toLocaleDateString()}</td>
                          <td className="py-4 px-2">
                            <Badge variant={equipment.usageCount > 100 ? "default" : "secondary"}>
                              {((equipment.usageCount / equipment.totalRequests) * 100).toFixed(1)}%
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