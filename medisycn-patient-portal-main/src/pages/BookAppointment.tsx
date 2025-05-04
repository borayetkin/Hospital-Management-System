
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { appointmentApi } from '@/api';
import { DoctorProfile, TimeSlot } from '@/types';
import Navbar from '@/components/Navbar';
import BookingCalendar from '@/components/BookingCalendar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const BookAppointment = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchDoctorDetails = async () => {
      if (!doctorId) return;

      try {
        setIsLoading(true);
        
        // Fetch doctor details and available dates
        const [doctorsData, availableDatesData] = await Promise.all([
          appointmentApi.getDoctors(),
          appointmentApi.getDoctorAvailableDates(parseInt(doctorId))
        ]);
        
        const selectedDoctor = doctorsData.find(d => d.doctorID === parseInt(doctorId));
        
        if (!selectedDoctor) {
          toast({
            title: "Error",
            description: "Doctor not found",
            variant: "destructive"
          });
          navigate('/doctors');
          return;
        }
        
        setDoctor(selectedDoctor);
        setAvailableDates(availableDatesData);
      } catch (error) {
        console.error('Error fetching doctor details:', error);
        toast({
          title: "Error",
          description: "Failed to load doctor details",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [isAuthenticated, doctorId, navigate, toast]);

  useEffect(() => {
    // Fetch time slots when a date is selected
    const fetchTimeSlots = async () => {
      if (!doctorId || !selectedDate) return;

      try {
        const dateString = selectedDate.toISOString().split('T')[0];
        const slots = await appointmentApi.getDoctorTimeSlots(parseInt(doctorId), dateString);
        setTimeSlots(slots);
      } catch (error) {
        console.error('Error fetching time slots:', error);
        toast({
          title: "Error",
          description: "Failed to load available time slots",
          variant: "destructive"
        });
      }
    };

    if (selectedDate) {
      fetchTimeSlots();
    } else {
      setTimeSlots([]);
      setSelectedSlot(null);
    }
  }, [doctorId, selectedDate, toast]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleBookAppointment = async () => {
    if (!doctorId || !selectedSlot) return;

    setIsBooking(true);
    try {
      await appointmentApi.bookAppointment(
        parseInt(doctorId),
        selectedSlot.startTime,
        selectedSlot.endTime
      );
      
      toast({
        title: "Success",
        description: "Appointment booked successfully",
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Booking Failed",
        description: "There was an error booking your appointment",
        variant: "destructive"
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/doctors')}
          className="mb-6 hover:bg-transparent hover:text-medisync-purple pl-0"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to doctors
        </Button>
        
        <h1 className="text-3xl font-bold mb-6">Book an Appointment</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Doctor Info */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <h2 className="text-xl font-semibold">Doctor Information</h2>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-gray-200 h-16 w-16"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ) : doctor ? (
                  <div>
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-medisync-purple/20 flex items-center justify-center text-medisync-purple text-lg font-bold">
                        {doctor.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{doctor.name}</h3>
                        <p className="text-sm text-gray-500">{doctor.specialization}</p>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Rating</p>
                        <div className="flex items-center mt-1">
                          <span className="font-semibold mr-1">{doctor.avgRating.toFixed(1)}</span>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg 
                                key={i}
                                className={`h-4 w-4 ${i < Math.floor(doctor.avgRating) ? "text-yellow-400" : "text-gray-300"}`}
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Experience</p>
                        <p className="font-semibold mt-1">{doctor.appointmentCount}+ appointments</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Doctor information not available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Booking Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Select Appointment Time</h2>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse space-y-6">
                    <div className="h-64 bg-gray-200 rounded"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ) : doctor ? (
                  <BookingCalendar
                    availableDates={availableDates}
                    onSelectDate={handleDateSelect}
                    selectedDate={selectedDate}
                    timeSlots={timeSlots}
                    selectedSlot={selectedSlot}
                    onSelectSlot={handleSlotSelect}
                    onConfirm={handleBookAppointment}
                    isLoading={isBooking}
                  />
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
