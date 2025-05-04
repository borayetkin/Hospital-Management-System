
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import Navbar from '@/components/Navbar';

const PatientManagement = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { data: patients, isLoading } = useQuery({
    queryKey: ['adminPatients'],
    queryFn: adminApi.getPatients,
  });

  const filteredPatients = patients?.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phoneNumber.includes(searchTerm)
  );

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <div className="my-8">
        <h1 className="text-3xl font-semibold mb-6">Patient Management</h1>
        
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search by name, email, or phone"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Patients ({filteredPatients?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading patients...</p>
            ) : filteredPatients && filteredPatients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-4 px-2">ID</th>
                      <th className="text-left py-4 px-2">Name</th>
                      <th className="text-left py-4 px-2">Date of Birth</th>
                      <th className="text-left py-4 px-2">Email</th>
                      <th className="text-left py-4 px-2">Phone</th>
                      <th className="text-left py-4 px-2">Balance</th>
                      <th className="text-left py-4 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((patient) => (
                      <tr key={patient.patientID} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-2">{patient.patientID}</td>
                        <td className="py-4 px-2">{patient.name}</td>
                        <td className="py-4 px-2">{patient.dateOfBirth}</td>
                        <td className="py-4 px-2">{patient.email}</td>
                        <td className="py-4 px-2">{patient.phoneNumber}</td>
                        <td className="py-4 px-2">${patient.balance.toFixed(2)}</td>
                        <td className="py-4 px-2">
                          <Button variant="outline" size="sm">View Details</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-4">No patients found matching your search.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientManagement;
