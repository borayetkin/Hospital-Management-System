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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Search,
  User,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { ResourceRequest } from "../../types/index";
import Navbar from "@/components/Navbar";
import { resourcesApi } from "@/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const ResourceRequests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] =
    useState<ResourceRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
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

  // Check if user is authenticated and is staff/admin
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

  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ["resourceRequests"],
    queryFn: () => resourcesApi.getAllResourceRequests(),
    enabled: isAuthenticated || manualAuthCheck, // Only run if authenticated
    retry: 1,
  });

  const approveMutation = useMutation({
    mutationFn: async ({
      doctorID,
      resourceID,
    }: {
      doctorID: number;
      resourceID: number;
    }) => {
      return resourcesApi.updateRequestStatus(doctorID, resourceID, "Approved");
    },
    onSuccess: () => {
      toast({
        title: "Request Approved",
        description: "The resource request has been approved successfully.",
      });
      setShowDetailsDialog(false);
      queryClient.invalidateQueries({ queryKey: ["resourceRequests"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({
      doctorID,
      resourceID,
    }: {
      doctorID: number;
      resourceID: number;
    }) => {
      return resourcesApi.updateRequestStatus(doctorID, resourceID, "Rejected");
    },
    onSuccess: () => {
      toast({
        title: "Request Rejected",
        description: "The resource request has been rejected.",
      });
      setShowRejectDialog(false);
      setRejectionReason("");
      queryClient.invalidateQueries({ queryKey: ["resourceRequests"] });
    },
  });

  const handleApprove = (doctorID: number, resourceID: number) => {
    approveMutation.mutate({ doctorID, resourceID });
  };

  const handleReject = () => {
    if (selectedRequest) {
      rejectMutation.mutate({
        doctorID: selectedRequest.doctorID,
        resourceID: selectedRequest.resourceID,
      });
    }
  };

  const filteredRequests = requests?.filter((request) => {
    const matchesSearch =
      (request.doctorName?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (request.resourceName?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      );
    const matchesStatus =
      statusFilter === "all" ||
      request.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "Approved":
        return <Badge variant="default">Approved</Badge>;
      case "Rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <div className="my-8">
        <h1 className="text-3xl font-semibold mb-6">
          Resource Request Management
        </h1>

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search by doctor or resource..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
            defaultValue="all"
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Resource Requests ({filteredRequests?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {requestsLoading ? (
              <div className="py-8 text-center">Loading requests...</div>
            ) : filteredRequests && filteredRequests.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Requester</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow
                        key={`${request.doctorID}-${request.resourceID}`}
                      >
                        <TableCell>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{request.doctorName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{request.resourceName}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowDetailsDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {request.status === "Pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleApprove(
                                      request.doctorID,
                                      request.resourceID
                                    )
                                  }
                                  disabled={approveMutation.isPending}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setShowRejectDialog(true);
                                  }}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-8 text-center">
                No resource requests found.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Request Details</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium">Requester:</label>
                    <p>{selectedRequest.doctorName}</p>
                  </div>
                  <div>
                    <label className="font-medium">Resource:</label>
                    <p>{selectedRequest.resourceName}</p>
                  </div>
                  <div>
                    <label className="font-medium">Status:</label>
                    <p>{selectedRequest.status}</p>
                  </div>
                  <div>
                    <label className="font-medium">Resource ID:</label>
                    <p>{selectedRequest.resourceID}</p>
                  </div>
                </div>
                {selectedRequest.status === "Pending" && (
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      onClick={() =>
                        handleApprove(
                          selectedRequest.doctorID,
                          selectedRequest.resourceID
                        )
                      }
                      disabled={approveMutation.isPending}
                    >
                      Approve Request
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setShowDetailsDialog(false);
                        setShowRejectDialog(true);
                      }}
                    >
                      Reject Request
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Resource Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>Are you sure you want to reject this resource request?</p>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Reason for rejection (optional):
                </label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this request..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowRejectDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={rejectMutation.isPending}
                >
                  Reject Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ResourceRequests;
