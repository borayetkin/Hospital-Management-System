import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import { format } from 'date-fns';
import { PatientProfile, Appointment, Process } from '../../types';
import { doctorApi } from '../../api';
import { CalendarDays, Star, AlertCircle, ArrowLeft } from 'lucide-react';

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
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            className="border-medisync-purple text-medisync-purple hover:bg-medisync-purple/5"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-medisync-dark-purple">Patient Medical History</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-pulse-light flex flex-col items-center">
              <div className="h-12 w-12 bg-medisync-purple/20 rounded-full mb-4"></div>
              <div className="h-4 bg-medisync-purple/20 rounded w-48 mb-2.5"></div>
              <div className="h-3 bg-medisync-purple/10 rounded w-40"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-6 rounded-lg flex items-center text-red-800">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
            <p>{error}</p>
          </div>
        ) : !patient ? (
          <div className="bg-yellow-50 p-6 rounded-lg flex items-center text-yellow-800">
            <AlertCircle className="h-6 w-6 text-yellow-500 mr-3" />
            <p>Patient not found.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Patient Info Card */}
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-medisync-purple/10 to-transparent border-b">
                <CardTitle className="text-xl text-medisync-dark-purple">Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-medisync-purple/5 to-transparent py-6 px-6">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/4 mb-4 md:mb-0">
                      <div className="w-20 h-20 rounded-full bg-white border-4 border-medisync-purple/20 flex items-center justify-center">
                        <span className="text-2xl font-bold text-medisync-purple">{patient.name.charAt(0)}</span>
                      </div>
                    </div>
                    <div className="md:w-3/4 space-y-1">
                      <h3 className="text-2xl font-bold text-medisync-dark-purple">{patient.name}</h3>
                      <p className="text-gray-500">Patient ID: {patient.patientID}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{patient.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{patient.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium">{patient.dob ? format(new Date(patient.dob), 'PPP') : 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appointments Card */}
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-medisync-purple/10 to-transparent border-b">
                <CardTitle className="text-xl flex items-center">
                  <CalendarDays className="h-5 w-5 mr-2 text-medisync-purple" />
                  Appointment History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {appointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="bg-blue-50 p-6 rounded-lg text-center">
                      <CalendarDays className="h-10 w-10 text-blue-400 mx-auto mb-3" />
                      <p className="text-blue-700 font-medium mb-2">No appointment history</p>
                      <p className="text-blue-600 text-sm">This patient has no appointments on record.</p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y">
                    {appointments.map(app => (
                      <div key={app.appointmentid || app.appointmentID} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <Badge className={getStatusColor(app.status)}>
                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                              </Badge>
                              <span className="text-gray-500 text-sm">
                                {app.starttime || app.startTime ? 
                                  format(new Date(app.starttime || app.startTime), 'MMMM d, yyyy') : 'N/A'}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-gray-500">
                                <CalendarDays className="h-4 w-4 mr-2 text-medisync-purple" />
                                {app.starttime || app.startTime ? 
                                  format(new Date(app.starttime || app.startTime), 'h:mm a') : 'N/A'} - 
                                {app.endtime || app.endTime ? 
                                  format(new Date(app.endtime || app.endTime), 'h:mm a') : 'N/A'}
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-500">Doctor: </span>
                                <span className="font-medium">{app.doctorName || app.doctorname || "Unknown"}</span>
                              </div>
                              {app.specialization && (
                                <div className="text-sm">
                                  <span className="text-gray-500">Specialization: </span>
                                  <span className="font-medium">{app.specialization}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {app.status === 'completed' && (app.rating || app.review) && (
                            <div className="bg-gray-50 p-4 rounded-lg min-w-[250px]">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Rating & Review</h4>
                              {app.rating && (
                                <div className="flex items-center mb-2">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star 
                                        key={i} 
                                        className={`h-4 w-4 ${i < app.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                      />
                                    ))}
                                  </div>
                                  <span className="ml-2 text-sm font-medium">{app.rating}/5</span>
                                </div>
                              )}
                              {app.review && (
                                <p className="text-sm text-gray-600 italic">"{app.review}"</p>
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

            {/* Medical Processes Card */}
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-medisync-purple/10 to-transparent border-b">
                <CardTitle className="text-xl flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-medisync-purple">
                    <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
                    <path d="M19 17V5a2 2 0 0 0-2-2H4" />
                    <path d="M15 8h.01" />
                    <path d="M15 12h.01" />
                    <path d="M15 16h.01" />
                  </svg>
                  Medical Processes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {processes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="bg-amber-50 p-6 rounded-lg text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 text-amber-400">
                        <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
                        <path d="M19 17V5a2 2 0 0 0-2-2H4" />
                        <path d="M15 8h.01" />
                        <path d="M15 12h.01" />
                        <path d="M15 16h.01" />
                      </svg>
                      <p className="text-amber-700 font-medium mb-2">No medical processes</p>
                      <p className="text-amber-600 text-sm">This patient has no medical processes on record.</p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y">
                    {processes.map(process => (
                      <div key={process.processid} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <h3 className="font-medium text-lg">{process.processName}</h3>
                              <Badge className={getStatusColor(process.status)}>
                                {process.status}
                              </Badge>
                            </div>
                            <p className="text-gray-600">{process.processDescription}</p>
                            <div className="text-sm">
                              <span className="text-gray-500">Date: </span>
                              <span className="font-medium">{process.billing.billingDate ? format(new Date(process.billing.billingDate), 'PPP') : 'N/A'}</span>
                            </div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg min-w-[200px]">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Billing Information</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Amount:</span>
                                <span className="font-medium">${process.billing.amount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Status:</span>
                                <Badge 
                                  variant="outline" 
                                  className={`font-normal ${
                                    process.billing.paymentStatus.toLowerCase() === 'paid' 
                                      ? 'bg-green-100 text-green-800 border-green-200' 
                                      : ''
                                  }`}
                                >
                                  {process.billing.paymentStatus || 'Pending'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientMedicalHistory; 