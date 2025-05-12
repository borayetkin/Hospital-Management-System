import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { doctorApi } from '@/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';

const DoctorPatients = () => {
  const { data: patients, isLoading } = useQuery({
    queryKey: ['doctorPatients'],
    queryFn: doctorApi.getPatients,
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold text-medisync-dark-purple">Patients</h1>
        </div>
        <Card className="border-none shadow-sm">
          <CardHeader className="bg-gradient-to-r from-medisync-purple/5 to-transparent border-b">
            <CardTitle className="text-xl flex items-center">
              <Users className="h-5 w-5 mr-2 text-medisync-purple" />
              Patient Records
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-pulse-light flex flex-col items-center">
                  <div className="h-12 w-12 bg-medisync-purple/20 rounded-full mb-4"></div>
                  <div className="h-4 bg-medisync-purple/20 rounded w-48 mb-2.5"></div>
                  <div className="h-3 bg-medisync-purple/10 rounded w-40"></div>
                </div>
              </div>
            ) : patients && patients.length > 0 ? (
              <div className="grid gap-5">
                {patients.map(patient => (
                  <div key={patient.patientID} className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-medisync-purple/20 overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="bg-gradient-to-br from-medisync-purple/10 to-medisync-purple/5 p-4 md:p-6 flex items-center justify-center md:w-1/5">
                        <div className="bg-white h-16 w-16 rounded-full border-4 border-medisync-purple/10 flex items-center justify-center">
                          <span className="text-xl font-bold text-medisync-purple">
                            {patient.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="p-5 md:p-6 flex-1">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="space-y-3">
                            <h3 className="font-semibold text-lg text-medisync-dark-purple">{patient.name}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 text-sm">
                              <div>
                                <span className="text-gray-500">Email:</span>
                                <p className="font-medium">{patient.email}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Date of Birth:</span>
                                <p className="font-medium">{patient.dateOfBirth || patient.dob || "N/A"}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Patient ID:</span>
                                <p className="font-medium">{patient.patientID}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Phone:</span>
                                <p className="font-medium">{patient.phoneNumber || "N/A"}</p>
                              </div>
                            </div>
                          </div>
                          <Link to={`/doctor/patients/${patient.patientID}/history`}>
                            <Button className="bg-medisync-purple hover:bg-medisync-purple-dark text-white w-full lg:w-auto">
                              Medical History
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-amber-50 px-6 py-10 rounded-lg inline-flex flex-col items-center">
                  <Users className="h-12 w-12 text-amber-500 mb-4" />
                  <h3 className="text-lg font-medium text-amber-700 mb-2">No patients found</h3>
                  <p className="text-amber-600 mb-6">You don't have any patients in your records yet.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorPatients; 