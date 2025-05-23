import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Search, User, CheckCircle, XCircle, Eye } from 'lucide-react';
import { ResourceRequest } from '../../types/index';
import Navbar from '@/components/Navbar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ResourceRequests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<ResourceRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data for resource requests
  const mockRequests: ResourceRequest[] = [
    {
      doctorID: 101,
      resourceID: 1,
      status: 'Pending',
      doctorName: 'Dr. Sarah Johnson',
      resourceName: 'CT Scanner',
      requestDate: '2024-05-25',
      justification: 'Emergency case requiring immediate scan'
    },
    {
      doctorID: 102,
      resourceID: 2,
      status: 'Approved',
      doctorName: 'Dr. James Wilson',
      resourceName: 'X-Ray Machine',
      requestDate: '2024-05-24',
      justification: 'Patient with suspected fracture'
    },
    {
      doctorID: 103,
      resourceID: 3,
      status: 'Rejected',
      doctorName: 'Dr. Emily Parker',
      resourceName: 'MRI Scanner',
      requestDate: '2024-05-23',
      justification: 'Detailed scan needed for diagnosis'
    },
    {
      doctorID: 104,
      resourceID: 4,
      status: 'Pending',
      doctorName: 'Dr. Michael Brown',
      resourceName: 'Ultrasound Machine',
      requestDate: '2024-05-25',
      justification: 'Pregnancy checkup'
    }
  ];

  const { data: requests, isLoading } = useQuery({
    queryKey: ['resourceRequests'],
    queryFn: () => Promise.resolve(mockRequests),
  });

  const approveMutation = useMutation({
    mutationFn: async ({doctorID, resourceID}: {doctorID: number, resourceID: number}) => {
      // Simulate API call to approve request
      await new Promise(resolve => setTimeout(resolve, 800));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Request Approved",
        description: "The resource request has been approved successfully.",
      });
      setShowDetailsDialog(false);
      queryClient.invalidateQueries({ queryKey: ['resourceRequests'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({doctorID, resourceID, reason}: {doctorID: number, resourceID: number, reason: string}) => {
      // Simulate API call to reject request
      await new Promise(resolve => setTimeout(resolve, 800));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Request Rejected",
        description: "The resource request has been rejected.",
      });
      setShowRejectDialog(false);
      setRejectionReason('');
      queryClient.invalidateQueries({ queryKey: ['resourceRequests'] });
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
        reason: rejectionReason 
      });
    }
  };

  const filteredRequests = requests?.filter(request => {
    const matchesSearch = 
      (request.doctorName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (request.resourceName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'Approved':
        return <Badge variant="default">Approved</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <div className="my-8">
        <h1 className="text-3xl font-semibold mb-6">Resource Request Management</h1>
        
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
          
          <Select value={statusFilter} onValueChange={setStatusFilter} defaultValue="all">
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
            <CardTitle>Resource Requests ({filteredRequests?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center">Loading requests...</div>
            ) : filteredRequests && filteredRequests.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Requester</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={`${request.doctorID}-${request.resourceID}`}>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{request.doctorName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{request.resourceName}</TableCell>
                        <TableCell>{request.requestDate}</TableCell>
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
                            
                            {request.status === 'Pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleApprove(request.doctorID, request.resourceID)}
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
              <div className="py-8 text-center">No resource requests found.</div>
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
                    <label className="font-medium">Date Requested:</label>
                    <p>{selectedRequest.requestDate}</p>
                  </div>
                  <div>
                    <label className="font-medium">Status:</label>
                    <p>{selectedRequest.status}</p>
                  </div>
                </div>
                {selectedRequest.justification && (
                  <div>
                    <label className="font-medium">Justification:</label>
                    <p className="mt-1 p-2 bg-gray-50 rounded-md border">{selectedRequest.justification}</p>
                  </div>
                )}
                {selectedRequest.status === 'Pending' && (
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      onClick={() => handleApprove(selectedRequest.doctorID, selectedRequest.resourceID)}
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
                <label className="block text-sm font-medium mb-2">Reason for rejection:</label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this request..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleReject}
                  disabled={rejectMutation.isPending || !rejectionReason.trim()}
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