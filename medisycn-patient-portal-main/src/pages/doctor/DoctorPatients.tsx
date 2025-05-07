import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { doctorApi } from '@/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { Link } from 'react-router-dom';

const DoctorPatients = () => {
  const { data: patients, isLoading } = useQuery({
    queryKey: ['doctorPatients'],
    queryFn: doctorApi.getPatients,
  });

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <div className="my-8">
        <h1 className="text-3xl font-semibold mb-6">Patients</h1>
        <Card>
          <CardHeader>
            <CardTitle>Patients</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading...</p>
            ) : patients && patients.length > 0 ? (
              <div className="space-y-4">
                {patients.map(patient => (
                  <div key={patient.patientID} className="border p-3 rounded-md flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <p><strong>Name:</strong> {patient.name}</p>
                      <p><strong>Email:</strong> {patient.email}</p>
                      <p><strong>Date of Birth:</strong> {patient.dateOfBirth}</p>
                      <p><strong>Phone:</strong> {patient.phoneNumber}</p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <Link to={`/doctor/patients/${patient.patientID}/history`}>
                        <Button variant="secondary">Medical History</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No patients found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorPatients; 