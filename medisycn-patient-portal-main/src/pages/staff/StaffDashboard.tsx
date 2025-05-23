import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Calendar, Clock, Package, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';

const StaffDashboard = () => {
  // Mock data for pending requests count
  const pendingRequestsCount = 12;
  
  const mockStats = {
    totalRequests: 48,
    approvedToday: 15,
    pendingRequests: 12,
    resourcesManaged: 125
  };

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <div className="my-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">Staff Dashboard</h1>
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-gray-600" />
            {pendingRequestsCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {pendingRequestsCount}
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalRequests}</div>
              <p className="text-xs text-muted-foreground">
                All time resource requests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.approvedToday}</div>
              <p className="text-xs text-muted-foreground">
                Requests processed today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {mockStats.pendingRequests}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting your review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resources Managed</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.resourcesManaged}</div>
              <p className="text-xs text-muted-foreground">
                Total resources in system
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => window.location.href = '/staff/resource-requests'}
              >
                <Clock className="h-4 w-4 mr-2" />
                Review Pending Requests
                {pendingRequestsCount > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {pendingRequestsCount}
                  </Badge>
                )}
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => window.location.href = '/staff/resources'}
              >
                <Package className="h-4 w-4 mr-2" />
                Manage Resources
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">CT Scanner requested</span>
                  <Badge variant="secondary">2 min ago</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">X-Ray approved</span>
                  <Badge variant="default">5 min ago</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Surgery Kit requested</span>
                  <Badge variant="secondary">10 min ago</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;