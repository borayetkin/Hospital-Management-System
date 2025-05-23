import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Package, Plus, AlertCircle } from 'lucide-react';
import { MedicalResource } from '../../types/index';
import Navbar from '@/components/Navbar';

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');

  // Mock data for medical resources
  const mockResources: MedicalResource[] = [
    {
      resourceID: 1,
      name: 'CT Scanner',
      availability: 'Available'
    },
    {
      resourceID: 2,
      name: 'X-Ray Machine',
      availability: 'In Use'
    },
    {
      resourceID: 3,
      name: 'MRI Scanner',
      availability: 'Maintenance'
    },
    {
      resourceID: 4,
      name: 'Ultrasound Machine',
      availability: 'Available'
    },
    {
      resourceID: 5,
      name: 'Surgical Kit',
      availability: 'Available'
    }
  ];

  const { data: resources, isLoading } = useQuery({
    queryKey: ['medicalResources'],
    queryFn: () => Promise.resolve(mockResources),
  });

  const filteredResources = resources?.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAvailability = availabilityFilter === 'all' || resource.availability === availabilityFilter;
    
    return matchesSearch && matchesAvailability;
  });

  const getAvailabilityBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return <Badge variant="default" className="bg-green-500">Available</Badge>;
      case 'In Use':
        return <Badge variant="secondary">In Use</Badge>;
      case 'Maintenance':
        return <Badge variant="destructive">Maintenance</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <div className="my-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">Manage Resources</h1>
          <Button>
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
          
          <Select value={availabilityFilter} onValueChange={setAvailabilityFilter} defaultValue="all">
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
        {isLoading ? (
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
                  <div className="text-sm text-gray-500">Resource ID: {resource.resourceID}</div>
                  <div className="flex justify-between items-center mt-4">
                    <Button variant="outline" size="sm">
                      Set to maintenance
                    </Button>
                    {resource.availability === 'Maintenance' && (
                      <Button size="sm">
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
      </div>
    </div>
  );
};

export default Resources;