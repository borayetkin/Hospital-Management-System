
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Star, MessageSquare } from 'lucide-react';
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { Appointment, Doctor, Review } from '@/types';

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

const AppointmentCard = ({ 
  appointment, 
  doctor, 
  onReviewClick
}: { 
  appointment: Appointment, 
  doctor: Doctor, 
  onReviewClick: (appointment: Appointment) => void 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-start gap-4 pb-2">
        <Avatar>
          <AvatarImage src={doctor.avatar} />
          <AvatarFallback>{getInitials(doctor.name)}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <CardTitle className="text-lg">{doctor.name}</CardTitle>
          <CardDescription>{doctor.specialization}</CardDescription>
        </div>
        <div className="ml-auto">
          <Badge className={getStatusColor(appointment.status)} variant="outline">
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(appointment.date)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{appointment.startTime} - {appointment.endTime}</span>
          </div>
        </div>
        <Separator className="my-2" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="text-sm font-medium">
              Amount: ${appointment.price}
            </div>
            <Badge variant="outline" className="ml-1 text-xs">
              {appointment.isPaid ? 'Paid' : 'Unpaid'}
            </Badge>
          </div>
          {appointment.status === 'completed' && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onReviewClick(appointment)}
              className="flex items-center gap-1"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Review</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Appointments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorsMap, setDoctorsMap] = useState<Map<string, Doctor>>(new Map());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedAppointments, setReviewedAppointments] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user || user.role !== 'patient') {
      navigate('/login');
      return;
    }

    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const appointmentsData = await dataService.getPatientAppointments(user.id);
        setAppointments(appointmentsData);
        
        // Fetch doctors for these appointments
        const doctorsData = new Map<string, Doctor>();
        for (const appointment of appointmentsData) {
          if (!doctorsData.has(appointment.doctorId)) {
            const doctor = await dataService.getDoctor(appointment.doctorId);
            if (doctor) {
              doctorsData.set(appointment.doctorId, doctor);
            }
          }
        }
        setDoctorsMap(doctorsData);
        
        // Check which appointments have been reviewed
        const reviewed = new Set<string>();
        for (const appointment of appointmentsData) {
          if (appointment.status === 'completed') {
            const doctorReviews = await dataService.getReviewsForDoctor(appointment.doctorId);
            for (const review of doctorReviews) {
              if (review.appointmentId === appointment.id) {
                reviewed.add(appointment.id);
                break;
              }
            }
          }
        }
        setReviewedAppointments(reviewed);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast.error('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user, navigate]);

  const handleReviewClick = (appointment: Appointment) => {
    if (reviewedAppointments.has(appointment.id)) {
      toast.info('You have already reviewed this appointment');
      return;
    }
    setSelectedAppointment(appointment);
    setRating(5);
    setComment('');
    setReviewOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedAppointment || !user) return;
    
    setSubmittingReview(true);
    try {
      await dataService.addReview({
        appointmentId: selectedAppointment.id,
        patientId: user.id,
        doctorId: selectedAppointment.doctorId,
        rating,
        comment,
      });
      
      toast.success('Review submitted successfully');
      setReviewedAppointments(prev => new Set(prev).add(selectedAppointment.id));
      setReviewOpen(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Filter appointments by status
  const upcomingAppointments = appointments.filter(a => a.status === 'scheduled');
  const pastAppointments = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  // Render star rating input
  const StarRating = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="p-1"
          >
            <Star 
              className={`h-6 w-6 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Appointments</h1>
        <Button onClick={() => navigate('/doctors')}>
          Book New Appointment
        </Button>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <h3 className="text-lg font-medium mb-2">No upcoming appointments</h3>
              <p className="text-muted-foreground mb-6">You don't have any scheduled appointments.</p>
              <Button onClick={() => navigate('/doctors')}>Book an Appointment</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingAppointments.map((appointment) => {
                const doctor = doctorsMap.get(appointment.doctorId);
                return doctor ? (
                  <AppointmentCard 
                    key={appointment.id} 
                    appointment={appointment} 
                    doctor={doctor}
                    onReviewClick={handleReviewClick}
                  />
                ) : null;
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pastAppointments.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <h3 className="text-lg font-medium">No past appointments</h3>
              <p className="text-muted-foreground">Your appointment history will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pastAppointments.map((appointment) => {
                const doctor = doctorsMap.get(appointment.doctorId);
                return doctor ? (
                  <AppointmentCard 
                    key={appointment.id} 
                    appointment={appointment} 
                    doctor={doctor}
                    onReviewClick={handleReviewClick}
                  />
                ) : null;
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              Share your experience with {selectedAppointment && doctorsMap.get(selectedAppointment.doctorId)?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <StarRating />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Comments</label>
              <Textarea 
                placeholder="Share your experience..." 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitReview} disabled={submittingReview || !comment.trim()}>
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Appointments;
