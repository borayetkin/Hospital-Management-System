import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Search, Package, Plus, Clock, CheckCircle } from 'lucide-react';
import { MedicalResource, ResourceRequest } from '../../types/index';
import Navbar from '@/components/Navbar';

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedResource, setSelectedResource] = useState<MedicalResource | null>(null);
  const [justification, setJustification] = useState('');
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data based on your MedicalResources table
  const mockResources: MedicalResource[] = [
    {
      resourceID: 1,
      name: 'CT Scanner',
      availability: 'Available'
    },
    {
      resourceID: 2,
      name: 'X-Ray Machine',
      availability: 'Available'
    },
    {
      resourceID: 3,
      name: 'MRI Scanner',
      availability: 'In Use'
    },
    {
      resourceID: 4,
      name: 'Ultrasound Machine',
      availability: 'Available'
    },
    {
      resourceID: 5,
      name: 'Surgical Robot',
      availability: 'Maintenance'
    }
  ];

  // Mock data for current doctor's requests
  const mockRequests: ResourceRequest[] = [
    {
      doctorID: 101,
      resourceID: 1,
      status: 'Pending',
      resourceName: 'CT Scanner',
      requestDate: '2024-01-15',
      justification: 'Emergency patient needs immediate CT scan'
    },
    {
      doctorID: 101,
      resourceID: 2,
      status: 'Approved',
      resourceName: 'X-Ray Machine',
      requestDate: '2024-01-14',
      justification: 'Routine chest X-ray for patient'
    }
  ];

  const { data: resources, isLoading } = useQuery({
    queryKey: ['medicalResources'],
    queryFn: () => Promise.resolve(mockResources),
  });

  const { data: myRequests } = useQuery({
    queryKey: ['myResourceRequests'],
    queryFn: () => Promise.resolve(mockRequests),
  });

  const requestMutation = useMutation({
    mutationFn: async (data: { resourceID: number; justification: string }) => {
      // Simulate API call to create request
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted",
        description: "Your resource request has been submitted for approval.",
      });
      queryClient.invalidateQueries({ queryKey: ['myResourceRequests'] });
      setShowRequestDialog(false);
      setJustification('');
      setSelectedResource(null);
    },
  });

  const handleRequestResource = () => {
    if (selectedResource) {
      requestMutation.mutate({
        resourceID: selectedResource.resourceID,
        justification: justification
      });
    }
  };

  const filteredResources = resources?.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAvailability = !availableOnly || resource.availability === 'Available';
    return matchesSearch && matchesAvailability;
  });

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'Available':
        return <Badge variant="default" className="bg-green-500">Available</Badge>;
      case 'In Use':
        return <Badge variant="secondary">In Use</Badge>;
      case 'Maintenance':
        return <Badge variant="destructive">Maintenance</Badge>;
      default:
        return <Badge variant="outline">{availability}</Badge>;
    }
  };

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
        <h1 className="text-3xl font-semibold mb-6">Medical Resources</h1>
        
        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search resources..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant={availableOnly ? "default" : "outline"}
            onClick={() => setAvailableOnly(!availableOnly)}
          >
            Available Only
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Available Resources */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Available Resources ({filteredResources?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p>Loading resources...</p>
                ) : filteredResources && filteredResources.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredResources.map((resource) => (
                      <Card key={resource.resourceID} className="border hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center">
                              <Package className="h-5 w-5 text-blue-500 mr-2" />
                              <h3 className="font-medium">{resource.name}</h3>
                            </div>
                            {getAvailabilityBadge(resource.availability)}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">ID: {resource.resourceID}</span>
                            <Button
                              size="sm"
                              disabled={resource.availability !== 'Available'}
                              onClick={() => {
                                setSelectedResource(resource);
                                setShowRequestDialog(true);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Request
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4">No resources found matching your criteria.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* My Requests */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>My Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {myRequests && myRequests.length > 0 ? (
                  <div className="space-y-3">
                    {myRequests.map((request, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm">{request.resourceName}</h4>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {request.requestDate}
                        </div>
                        {request.status === 'Approved' && (
                          <div className="flex items-center text-xs text-green-600 mt-1">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Ready to use
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-gray-500">No requests yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Request Dialog */}
        <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Medical Resource</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedResource && (
                <div>
                  <h3 className="font-medium">Resource: {selectedResource.name}</h3>
                  <p className="text-sm text-gray-600">ID: {selectedResource.resourceID}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Justification for Request <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Please provide a detailed justification for why you need this resource..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleRequestResource}
                  disabled={requestMutation.isPending || !justification.trim()}
                >
                  {requestMutation.isPending ? 'Submitting...' : 'Submit Request'}
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