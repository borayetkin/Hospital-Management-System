import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, Clock, Package, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import { resourcesApi } from "@/api";
import { formatDistanceToNow } from "date-fns";

// Default values to show when API requests fail
const DEFAULT_STATS = {
  totalRequests: 0,
  approvedToday: 0,
  pendingRequests: 0,
  resourcesManaged: 0,
};

const DEFAULT_ACTIVITIES = [
  {
    doctorID: 0,
    resourceID: 0,
    status: "Pending",
    resourceName: "Sample Resource",
    doctorName: "Dr. Sample",
    timestamp: new Date().toISOString(),
  },
];

const StaffDashboard = () => {
  // Fetch resource statistics
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["resourceStats"],
    queryFn: resourcesApi.getResourceStats,
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 2,
    staleTime: 10000,
  });

  // Fetch recent activities
  const {
    data: activities,
    isLoading: activitiesLoading,
    error: activitiesError,
  } = useQuery({
    queryKey: ["recentActivities"],
    queryFn: () => resourcesApi.getRecentActivities(5), // Get 5 most recent activities
    refetchInterval: 15000, // Refresh every 15 seconds
    retry: 2,
    staleTime: 10000,
  });

  // Format the activity text based on status
  const getActivityText = (activity: any) => {
    const resourceName = activity.resourceName;
    switch (activity.status) {
      case "Pending":
        return `${resourceName} requested`;
      case "Approved":
        return `${resourceName} approved`;
      case "Rejected":
        return `${resourceName} rejected`;
      default:
        return `${resourceName} ${activity.status}`;
    }
  };

  // Format timestamp as relative time
  const formatTimeAgo = (timestamp: string) => {
    try {
      return (
        formatDistanceToNow(new Date(timestamp), { addSuffix: false }) + " ago"
      );
    } catch (error) {
      return "recently";
    }
  };

  // Use either API data or defaults if there's an error
  const displayStats = statsError ? DEFAULT_STATS : stats || DEFAULT_STATS;
  const displayActivities = activitiesError
    ? DEFAULT_ACTIVITIES
    : activities || [];

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <div className="my-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">Staff Dashboard</h1>
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-gray-600" />
            {displayStats.pendingRequests > 0 && (
              <Badge variant="destructive" className="ml-1">
                {displayStats.pendingRequests}
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Requests
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : displayStats.totalRequests}
              </div>
              <p className="text-xs text-muted-foreground">
                All time resource requests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Approved Today
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : displayStats.approvedToday}
              </div>
              <p className="text-xs text-muted-foreground">
                Requests processed today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Requests
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {statsLoading ? "..." : displayStats.pendingRequests}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting your review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Resources Managed
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : displayStats.resourcesManaged}
              </div>
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
                onClick={() =>
                  (window.location.href = "/staff/resource-requests")
                }
              >
                <Clock className="h-4 w-4 mr-2" />
                Review Pending Requests
                {displayStats.pendingRequests > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {displayStats.pendingRequests}
                  </Badge>
                )}
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => (window.location.href = "/staff/resources")}
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
              {activitiesLoading ? (
                <div className="text-center text-sm text-gray-500 py-2">
                  Loading activities...
                </div>
              ) : displayActivities && displayActivities.length > 0 ? (
                <div className="space-y-3">
                  {displayActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">
                        {getActivityText(activity)}
                      </span>
                      <Badge
                        variant={
                          activity.status === "Approved"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {formatTimeAgo(activity.timestamp)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-sm text-gray-500 py-2">
                  {activitiesError
                    ? "Could not load recent activities"
                    : "No recent activities"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
