import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <div className="my-8">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">Back</Button>
        <h1 className="text-3xl font-semibold mb-6">Patient Medical History</h1>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : !patient ? (
          <p>Patient not found.</p>
        ) : (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Patient Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><strong>Name:</strong> {patient.name}</div>
                  <div><strong>Email:</strong> {patient.email}</div>
                  <div><strong>Date of Birth:</strong> {patient.dob ? format(new Date(patient.dob), 'PPP') : 'N/A'}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <p>No appointments found.</p>
                ) : (
                  <div className="space-y-4">
                    {appointments.map(app => (
                      <div key={app.appointmentid} className="border p-3 rounded-md">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                          <div>
                            <p><strong>Date:</strong> {app.starttime ? format(new Date(app.starttime), 'PPP') : 'N/A'}</p>
                            <p><strong>Time:</strong> {app.starttime ? format(new Date(app.starttime), 'h:mm a') : 'N/A'} - {app.endtime ? format(new Date(app.endtime), 'h:mm a') : 'N/A'}</p>
                            <p><strong>Status:</strong> {app.status}</p>
                            <p><strong>Doctor:</strong> {app.doctorname}</p>
                            {app.specialization && <p><strong>Specialization:</strong> {app.specialization}</p>}
                          </div>
                          {app.rating && (
                            <div className="mt-2 md:mt-0">
                              <p><strong>Rating:</strong> {app.rating}</p>
                              <p><strong>Review:</strong> {app.review}</p>
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
              <CardHeader>
                <CardTitle>Medical Processes</CardTitle>
              </CardHeader>
              <CardContent>
                {processes.length === 0 ? (
                  <p>No processes found.</p>
                ) : (
                  <div className="space-y-4">
                    {processes.map(proc => (
                      <div key={proc.processid} className="border p-3 rounded-md">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                          <div>
                            <p><strong>Name:</strong> {proc.processName}</p>
                            <p><strong>Description:</strong> {proc.processDescription}</p>
                            <p><strong>Status:</strong> {proc.status}</p>
                            <p><strong>Date:</strong> {proc.process_date ? format(new Date(proc.process_date), 'PPP') : 'N/A'}</p>
                            <p><strong>Price:</strong> ${proc.amount}</p>
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