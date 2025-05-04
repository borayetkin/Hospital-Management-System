
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';

const DoctorManagement = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { data: doctors, isLoading } = useQuery({
    queryKey: ['adminDoctors'],
    queryFn: adminApi.getDoctors,
  });

  const filteredDoctors = doctors?.filter(doctor => 
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <div className="my-8">
        <h1 className="text-3xl font-semibold mb-6">Doctor Management</h1>
        
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search by name or specialization"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Doctors ({filteredDoctors?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading doctors...</p>
            ) : filteredDoctors && filteredDoctors.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-4 px-2">ID</th>
                      <th className="text-left py-4 px-2">Name</th>
                      <th className="text-left py-4 px-2">Specialization</th>
                      <th className="text-left py-4 px-2">Rating</th>
                      <th className="text-left py-4 px-2">Appointments</th>
                      <th className="text-left py-4 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDoctors.map((doctor) => (
                      <tr key={doctor.doctorID} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-2">{doctor.doctorID}</td>
                        <td className="py-4 px-2">{doctor.name}</td>
                        <td className="py-4 px-2">{doctor.specialization}</td>
                        <td className="py-4 px-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            {doctor.avgRating.toFixed(1)}
                          </div>
                        </td>
                        <td className="py-4 px-2">{doctor.appointmentCount}</td>
                        <td className="py-4 px-2">
                          <Button variant="outline" size="sm">View Details</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-4">No doctors found matching your search.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorManagement;
