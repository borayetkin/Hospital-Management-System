import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Package, Plus, AlertCircle } from "lucide-react";
import { MedicalResource } from "../../types/index";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { resourcesApi } from "@/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newResourceName, setNewResourceName] = useState("");
  const [manualAuthCheck, setManualAuthCheck] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading } = useAuth();

  // Manual check for token on initial load to prevent premature redirects
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    // Verify token format
    let isTokenValid = false;
    if (token) {
      const parts = token.split(".");
      isTokenValid = parts.length === 3;
    }

    setManualAuthCheck(!!token && !!userData && isTokenValid);

    console.log("Auth token available:", !!token);
    if (token) {
      console.log("Token first 10 chars:", token.substring(0, 10) + "...");
      console.log("Token valid format:", isTokenValid);
    }
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log("User role:", parsedUser.role);
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  // Check if user is authenticated and is staff/admin, but only after auth loading is complete
  useEffect(() => {
    // Skip redirect while still loading authentication state
    if (isLoading) {
      console.log("Auth still loading, skipping redirect check");
      return;
    }

    // Use both auth context and manual token check
    const isAuth = isAuthenticated || manualAuthCheck;

    if (!isAuth) {
      console.log("Not authenticated, redirecting to login");
      toast({
        title: "Authentication Required",
        description: "Please login to access this page",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    // Get user data from context or local storage
    const currentUser =
      user ||
      (() => {
        try {
          const userData = localStorage.getItem("user");
          return userData ? JSON.parse(userData) : null;
        } catch {
          return null;
        }
      })();

    console.log(
      "Current user:",
      currentUser ? `${currentUser.name} (${currentUser.role})` : "No user data"
    );

    // Only check role if user object is available
    if (
      currentUser &&
      currentUser.role &&
      currentUser.role.toLowerCase() !== "staff" &&
      currentUser.role.toLowerCase() !== "admin"
    ) {
      console.log("Access denied: User role is not staff or admin");
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, user, navigate, toast, manualAuthCheck]);

  // Fetch resources from API
  const {
    data: resources,
    isLoading: isLoadingResources,
    error,
  } = useQuery({
    queryKey: ["medicalResources"],
    queryFn: () => resourcesApi.getResources(),
    enabled: isAuthenticated || manualAuthCheck, // Run query if authenticated or we have manual token check
    retry: 1,
  });

  const addResourceMutation = useMutation({
    mutationFn: async (name: string) => {
      // Call the API to create a new resource
      return resourcesApi.createResource({ name, availability: "Available" });
    },
    onSuccess: () => {
      toast({
        title: "Resource Added",
        description: "The new resource has been added successfully.",
      });
      setShowAddDialog(false);
      setNewResourceName("");
      queryClient.invalidateQueries({ queryKey: ["medicalResources"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add resource: ${error}`,
        variant: "destructive",
      });
    },
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: async ({
      resourceId,
      availability,
    }: {
      resourceId: number;
      availability: string;
    }) => {
      // Call the API to update resource availability
      return resourcesApi.updateResourceAvailability(resourceId, availability);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicalResources"] });
      toast({
        title: "Status Updated",
        description: "The resource status has been updated.",
      });
    },
  });

  const handleAddResource = () => {
    if (newResourceName.trim()) {
      addResourceMutation.mutate(newResourceName);
    }
  };

  const handleSetMaintenance = (resourceId: number) => {
    updateAvailabilityMutation.mutate({
      resourceId,
      availability: "Maintenance",
    });
  };

  const handleSetAvailable = (resourceId: number) => {
    updateAvailabilityMutation.mutate({
      resourceId,
      availability: "Available",
    });
  };

  const filteredResources = resources?.filter((resource) => {
    const matchesSearch = resource.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesAvailability =
      availabilityFilter === "all" ||
      resource.availability === availabilityFilter;

    return matchesSearch && matchesAvailability;
  });

  const getAvailabilityBadge = (status: string) => {
    switch (status) {
      case "Available":
        return (
          <Badge variant="default" className="bg-green-500">
            Available
          </Badge>
        );
      case "In Use":
        return <Badge variant="secondary">In Use</Badge>;
      case "Maintenance":
        return <Badge variant="destructive">Maintenance</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // If still loading auth state and we don't know if user is authenticated, show loading
  if (isLoading && !manualAuthCheck) {
    return (
      <div className="container mx-auto p-4">
        <Navbar />
        <div className="my-8 text-center">
          <h1 className="text-2xl font-semibold mb-4">Loading...</h1>
          <p>Please wait while we check your authentication status.</p>
        </div>
      </div>
    );
  }

  // If not authenticated after loading completes, show login message
  if (!isAuthenticated && !manualAuthCheck) {
    return (
      <div className="container mx-auto p-4">
        <Navbar />
        <div className="my-8 text-center">
          <h1 className="text-2xl font-semibold mb-4">
            Authentication Required
          </h1>
          <p>Please log in to access the resources management page.</p>
          <Button className="mt-4" onClick={() => navigate("/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Show error if API call fails
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Navbar />
        <div className="my-8">
          <div className="bg-red-50 border border-red-200 p-4 rounded-md">
            <h2 className="text-red-800 text-lg font-semibold">
              Error Loading Resources
            </h2>
            <p className="text-red-700">
              Could not load resources. Make sure you're properly logged in with
              staff permissions.
            </p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => navigate("/login")}
            >
              Re-Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <div className="my-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">Manage Resources</h1>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Resource
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search resources..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select
            value={availabilityFilter}
            onValueChange={setAvailabilityFilter}
            defaultValue="all"
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="In Use">In Use</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Resources Grid */}
        {isLoadingResources ? (
          <div className="py-8 text-center">Loading resources...</div>
        ) : filteredResources && filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <Card key={resource.resourceID}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{resource.name}</CardTitle>
                    {getAvailabilityBadge(resource.availability)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-500">
                    Resource ID: {resource.resourceID}
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    {resource.availability !== "Maintenance" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleSetMaintenance(resource.resourceID)
                        }
                        disabled={updateAvailabilityMutation.isPending}
                      >
                        Set to maintenance
                      </Button>
                    )}
                    {resource.availability === "Maintenance" && (
                      <Button
                        size="sm"
                        onClick={() => handleSetAvailable(resource.resourceID)}
                        disabled={updateAvailabilityMutation.isPending}
                      >
                        Mark as available
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center flex flex-col items-center">
              <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-500">No resources found.</p>
            </CardContent>
          </Card>
        )}

        {/* Add Resource Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Resource</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="resource-name">Resource Name</Label>
                <Input
                  id="resource-name"
                  value={newResourceName}
                  onChange={(e) => setNewResourceName(e.target.value)}
                  placeholder="Enter resource name (e.g., CT Scanner)"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddResource}
                  disabled={
                    addResourceMutation.isPending || !newResourceName.trim()
                  }
                >
                  {addResourceMutation.isPending ? "Adding..." : "Add Resource"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Resources;
