import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import { format } from 'date-fns';
import { PatientProfile, Appointment, Process } from '../../types';
import { doctorApi } from '../../api';

const PatientMedicalHistory: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { patient, appointments, processes } = await doctorApi.getPatientMedicalHistory(Number(patientId));
        setPatient(patient);
        setAppointments(appointments);
        setProcesses(processes);
      } catch (err: any) {
        setError('Failed to load medical history.');
      } finally {
        setLoading(false);
      }
    };
    if (patientId) fetchData();
  }, [patientId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <div className="my-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            ← Back
          </Button>
          <h1 className="text-3xl font-semibold">Patient Medical History</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg text-gray-600">Loading patient information...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-500">{error}</p>
          </div>
        ) : !patient ? (
          <div className="bg-yellow-50 p-4 rounded-md">
            <p className="text-yellow-700">Patient not found.</p>
          </div>
        ) : (
          <>
            <Card className="mb-6">
              <CardHeader className="bg-gray-50">
                <CardTitle className="text-xl">Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{patient.name}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{patient.email}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium">{patient.dob ? format(new Date(patient.dob), 'PPP') : 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader className="bg-gray-50">
                <CardTitle className="text-xl">Appointments</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {appointments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No appointments found.</p>
                ) : (
                  <div className="space-y-4">
                    {appointments.map(app => (
                      <div key={app.appointmentid} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(app.status)}>
                                {app.status}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-500">Date & Time</p>
                              <p className="font-medium">
                                {app.starttime ? format(new Date(app.starttime), 'PPP') : 'N/A'}
                              </p>
                              <p className="text-gray-600">
                                {app.starttime ? format(new Date(app.starttime), 'h:mm a') : 'N/A'} - 
                                {app.endtime ? format(new Date(app.endtime), 'h:mm a') : 'N/A'}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-500">Doctor</p>
                              <p className="font-medium">{app.doctorname}</p>
                              {app.specialization && (
                                <p className="text-sm text-gray-600">{app.specialization}</p>
                              )}
                            </div>
                          </div>
                          {app.rating && (
                            <div className="bg-gray-50 p-3 rounded-md">
                              <p className="text-sm text-gray-500">Rating & Review</p>
                              <p className="font-medium">Rating: {app.rating}/5</p>
                              {app.review && (
                                <p className="text-sm text-gray-600 mt-1">{app.review}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-gray-50">
                <CardTitle className="text-xl">Medical Processes</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {processes.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No medical processes found.</p>
                ) : (
                  <div className="space-y-4">
                    {processes.map(proc => (
                      <div key={proc.processid} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(proc.status)}>
                                {proc.status}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-500">Process Name</p>
                              <p className="font-medium">{proc.processName}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-500">Description</p>
                              <p className="text-gray-600">{proc.processDescription}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-500">Date</p>
                              <p className="font-medium">
                                {proc.process_date ? format(new Date(proc.process_date), 'PPP') : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm text-gray-500">Billing</p>
                            <p className="font-medium">${proc.amount}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Status: {proc.paymentStatus || 'Pending'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default PatientMedicalHistory; 