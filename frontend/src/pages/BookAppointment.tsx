
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parse } from 'date-fns';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarIcon, Clock, DollarSign, Star, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { Doctor, TimeSlot, Patient } from '@/types';
import { cn } from '@/lib/utils';

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

const BookAppointment = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [bookingSuccessful, setBookingSuccessful] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'patient' || !doctorId) {
      navigate('/login');
      return;
    }

    const fetchDoctor = async () => {
      setLoading(true);
      try {
        const doctorData = await dataService.getDoctor(doctorId);
        if (doctorData) {
          setDoctor(doctorData);
        } else {
          toast.error('Doctor not found');
          navigate('/doctors');
        }
      } catch (error) {
        console.error('Error fetching doctor details:', error);
        toast.error('Failed to load doctor details');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId, user, navigate]);

  useEffect(() => {
    if (!selectedDate || !doctorId) return;

    const fetchTimeSlots = async () => {
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const slots = await dataService.getTimeSlots(formattedDate, doctorId);
        setTimeSlots(slots);
      } catch (error) {
        console.error('Error fetching time slots:', error);
        toast.error('Failed to load available time slots');
      }
    };

    fetchTimeSlots();
  }, [selectedDate, doctorId]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    if (!slot.isAvailable) return;
    setSelectedSlot(slot);
  };

  const handleBookAppointment = async () => {
    if (!doctor || !selectedDate || !selectedSlot || !user) {
      toast.error('Please select a date and time slot');
      return;
    }

    const patient = user as Patient;
    if (patient.balance < doctor.price) {
      toast.error('Insufficient balance to book this appointment');
      return;
    }

    setBookingInProgress(true);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      await dataService.bookAppointment(
        patient.id,
        doctor.id,
        formattedDate,
        selectedSlot.startTime,
        selectedSlot.endTime,
        doctor.price
      );

      setBookingSuccessful(true);
      toast.success('Appointment booked successfully!');
      
      // Reset after success display
      setTimeout(() => {
        navigate('/appointments');
      }, 3000);
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
    } finally {
      setBookingInProgress(false);
    }
  };

  // Get day name for date
  const getDayName = (date: Date) => {
    return format(date, 'EEEE');
  };

  // Check if doctor is available on selected day
  const isDoctorAvailable = (date: Date) => {
    if (!doctor) return false;
    const dayName = getDayName(date);
    return doctor.availableDays.includes(dayName);
  };

  // Disable dates in the past and when doctor isn't available
  const disabledDays = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today || !isDoctorAvailable(date);
  };

  return (
    <div className="max-w-4xl mx-auto my-8 animate-fade-in">
      {loading ? (
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      ) : bookingSuccessful ? (
        <Card className="border-green-100 shadow-lg">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-6 w-6" />
              <CardTitle>Appointment Confirmed!</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-medium">Your appointment has been booked!</h3>
                <p className="text-muted-foreground mt-1">
                  You have successfully scheduled an appointment with {doctor?.name}.
                </p>
              </div>
              <div className="py-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-left bg-white rounded-lg p-4 border shadow-sm">
                  <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                    <AvatarImage src={doctor?.avatar} />
                    <AvatarFallback>{doctor ? getInitials(doctor.name) : 'DR'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{doctor?.name}</h4>
                    <p className="text-sm text-muted-foreground">{doctor?.specialization}</p>
                    <div className="mt-1 flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {selectedDate ? format(selectedDate, 'EEE, MMM d, yyyy') : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {selectedSlot?.startTime} - {selectedSlot?.endTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                You will be redirected to your appointments page in a moment...
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/appointments')}
            >
              View All Appointments
            </Button>
          </CardFooter>
        </Card>
      ) : doctor ? (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Book an Appointment</h1>
          
          {/* Doctor Info Card */}
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={doctor.avatar} />
                <AvatarFallback>{getInitials(doctor.name)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <CardTitle>{doctor.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Badge variant="outline">{doctor.specialization}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{doctor.rating}</span>
                  </div>
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">{doctor.bio}</p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>${doctor.price} per visit</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>Available on:</span>
                {doctor.availableDays.map(day => (
                  <Badge key={day} variant="secondary">{day}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Booking Process */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">1. Select a Date</CardTitle>
                <CardDescription>
                  Choose an available date for your appointment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={disabledDays}
                    className="rounded-md border shadow-sm"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Time Slot Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">2. Choose a Time Slot</CardTitle>
                <CardDescription>
                  Available time slots for {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'selected date'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedDate ? (
                  <div className="flex items-center justify-center h-48 border rounded-md bg-muted/20">
                    <p className="text-muted-foreground">Please select a date first</p>
                  </div>
                ) : timeSlots.length === 0 ? (
                  <div className="flex items-center justify-center h-48 border rounded-md bg-muted/20">
                    <div className="text-center">
                      <p className="text-muted-foreground">Loading available time slots...</p>
                      <div className="mt-2">
                        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.id}
                        disabled={!slot.isAvailable}
                        onClick={() => handleTimeSlotSelect(slot)}
                        className={cn(
                          "flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors border",
                          slot.isAvailable
                            ? selectedSlot?.id === slot.id
                              ? "bg-primary text-primary-foreground border-primary"
                              : "hover:bg-primary/10 border-input"
                            : "bg-muted/50 text-muted-foreground cursor-not-allowed border-transparent"
                        )}
                      >
                        {slot.startTime} - {slot.endTime}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Confirmation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">3. Confirm and Pay</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedDate && selectedSlot ? (
                  <div className="rounded-lg border p-4 bg-muted/20">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Appointment Details</span>
                        <Badge variant="outline" className="ml-2">
                          {selectedSlot.startTime} - {selectedSlot.endTime}
                        </Badge>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Doctor</p>
                          <p className="font-medium">{doctor.name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Specialization</p>
                          <p className="font-medium">{doctor.specialization}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Fee</p>
                          <p className="font-medium">${doctor.price}</p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>${doctor.price}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm p-2 bg-yellow-50 text-yellow-700 rounded-md">
                        <AlertCircle className="h-4 w-4" />
                        <span>Payment will be processed from your account balance.</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 border rounded-md bg-muted/20">
                    <p className="text-muted-foreground">Please select a date and time slot</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                disabled={!selectedDate || !selectedSlot || bookingInProgress}
                onClick={handleBookAppointment}
              >
                {bookingInProgress 
                  ? 'Processing...' 
                  : `Confirm & Pay $${doctor.price}`}
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Doctor not found</p>
          <Button 
            variant="link" 
            onClick={() => navigate('/doctors')}
            className="mt-2"
          >
            Return to doctors list
          </Button>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;
