import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Users, CalendarDays, Building, DollarSign } from 'lucide-react';
import Navbar from '@/components/Navbar';

const COLORS = ['#9b87f5', '#7E69AB', '#6E59A5', '#e5deff'];

const AdminDashboard = () => {
  const [statsPeriod, setStatsPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const { data: doctors, isLoading: doctorsLoading } = useQuery({
    queryKey: ['adminDoctors'],
    queryFn: adminApi.getDoctors,
  });

  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ['adminPatients'],
    queryFn: adminApi.getPatients,
  });

  const { data: appointmentStats, isLoading: appointmentStatsLoading } = useQuery({
    queryKey: ['appointmentStats', statsPeriod],
    queryFn: () => adminApi.getAppointmentStats(statsPeriod),
  });

  const { data: revenueStats, isLoading: revenueStatsLoading } = useQuery({
    queryKey: ['revenueStats', statsPeriod],
    queryFn: () => adminApi.getRevenueStats(statsPeriod),
  });

  const isLoading = doctorsLoading || patientsLoading || appointmentStatsLoading || revenueStatsLoading;

  const pieData = appointmentStats ? [
    { name: 'Scheduled', value: appointmentStats.scheduledappointments },
    { name: 'Completed', value: appointmentStats.completedappointments },
    { name: 'Cancelled', value: appointmentStats.cancelledappointments }
  ] : [];

  const barData = appointmentStats ? [
    { name: 'Total', appointments: appointmentStats.totalappointments },
    { name: 'Scheduled', appointments: appointmentStats.scheduledappointments },
    { name: 'Completed', appointments: appointmentStats.completedappointments },
    { name: 'Cancelled', appointments: appointmentStats.cancelledappointments }
  ] : [];

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
        <h1 className="text-3xl font-semibold mb-6">Admin Dashboard</h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Doctors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Building className="h-5 w-5 text-medisync-purple mr-2" />
                <span className="text-2xl font-bold">{doctors?.length || 0}</span>
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
                <span className="text-2xl font-bold">{patients?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
          
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
                  {appointmentStats?.totalappointments || 0}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-medisync-purple mr-2" />
                <span className="text-2xl font-bold">
                  ${revenueStats?.totalrevenue.toLocaleString() || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Period Selector */}
        <div className="mb-6 flex items-center">
          <span className="mr-4 text-sm font-medium">Time Period:</span>
          <Select value={statsPeriod} onValueChange={(value: any) => setStatsPeriod(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Stats Tabs */}
        <Tabs defaultValue="appointments" className="w-full">
          <TabsList>
            <TabsTrigger value="appointments">Appointment Statistics</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Statistics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appointments" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Statistics ({statsPeriod})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="w-full overflow-x-auto">
                    <BarChart
                      width={400}
                      height={300}
                      data={barData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="appointments" fill="#9b87f5" />
                    </BarChart>
                  </div>
                  
                  <div className="flex justify-center">
                    <PieChart width={500} height={300} margin={{ top: 20, right: 80, left: 80, bottom: 20 }}>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="revenue" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Statistics ({statsPeriod})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Revenue
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ${revenueStats?.totalrevenue.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Billing Count
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {revenueStats?.billingcount}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Average Billing Amount
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ${revenueStats?.avgbillingamount.toFixed(2)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="p-4 border rounded-md">
                  <h3 className="font-medium mb-2">Period Summary</h3>
                  <p>Start Date: {revenueStats?.startdate}</p>
                  <p>End Date: {revenueStats?.enddate}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
