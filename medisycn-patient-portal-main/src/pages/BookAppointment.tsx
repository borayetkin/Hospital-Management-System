import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { appointmentApi } from '@/api';
import { DoctorProfile, TimeSlot } from '@/types';
import Navbar from '@/components/Navbar';
import BookingCalendar from '@/components/BookingCalendar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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
      // Log the doctorId from URL params
      console.log("BookAppointment - doctorId param:", doctorId, typeof doctorId);
      
      if (!doctorId) {
        console.error("No doctorId provided in URL");
        toast({
          title: "Error",
          description: "No doctor ID provided",
          variant: "destructive"
        });
        navigate('/doctors');
        return;
      }

      try {
        setIsLoading(true);
        
        // Add debugging
        console.log("Doctor ID from URL param:", doctorId);
        const parsedDoctorId = parseInt(doctorId);
        console.log("Parsed Doctor ID:", parsedDoctorId, typeof parsedDoctorId);
        
        if (isNaN(parsedDoctorId)) {
          console.error("Invalid doctor ID:", doctorId);
          toast({
            title: "Error",
            description: "Invalid doctor ID",
            variant: "destructive"
          });
          navigate('/doctors');
          return;
        }
        
        // Fetch doctor details and available dates
        console.log("Making API calls with doctorId:", parsedDoctorId);
        
        try {
          // First get doctor details
          const doctorsData = await appointmentApi.getDoctors();
          console.log("All doctors:", doctorsData);
          console.log("Looking for doctor with ID:", parsedDoctorId);
          
          // Find the doctor with the matching ID, comparing as numbers to avoid string/number mismatches
          const selectedDoctor = doctorsData.find(d => {
            // Log each doctor's ID for debugging
            console.log(`Doctor ${d.name} has ID: ${d.doctorID}, type: ${typeof d.doctorID}`);
            // Convert both IDs to numbers for comparison if they're not already
            const doctorIdNum = typeof d.doctorID === 'number' ? d.doctorID : Number(d.doctorID);
            return doctorIdNum === parsedDoctorId;
          });
          
          console.log("Selected doctor:", selectedDoctor);
          
          if (!selectedDoctor) {
            console.error("No doctor found with ID:", parsedDoctorId);
            console.log("Available doctor IDs:", doctorsData.map(d => d.doctorID));
            toast({
              title: "Error",
              description: "Doctor not found",
              variant: "destructive"
            });
            navigate('/doctors');
            return;
          }
          
          setDoctor(selectedDoctor);
          
          // Now fetch available dates
          try {
            const availableDatesData = await appointmentApi.getDoctorAvailableDates(parsedDoctorId);
            console.log("Available dates:", availableDatesData);
            
            if (availableDatesData && Array.isArray(availableDatesData)) {
              setAvailableDates(availableDatesData);
            } else {
              console.error("Invalid availability data format:", availableDatesData);
              setAvailableDates([]); // Set empty array if data is invalid
              toast({
                title: "Warning",
                description: "Could not load available dates",
                variant: "destructive"
              });
            }
          } catch (datesError) {
            console.error("Error fetching available dates:", datesError);
            setAvailableDates([]); // Set empty array on error
            toast({
              title: "Warning",
              description: "Could not load available dates",
              variant: "destructive"
            });
          }
        } catch (doctorError) {
          console.error("Error fetching doctor:", doctorError);
          toast({
            title: "Error",
            description: "Failed to load doctor details",
            variant: "destructive"
          });
          navigate('/doctors');
          return;
        }
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
        const parsedDoctorId = parseInt(doctorId);
        if (isNaN(parsedDoctorId)) {
          console.error("Invalid doctor ID for time slots:", doctorId);
          return;
        }
        
        const dateString = selectedDate.toISOString().split('T')[0];
        console.log("Fetching time slots for doctor:", parsedDoctorId, "date:", dateString);
        
        try {
          const slotsResponse = await appointmentApi.getDoctorTimeSlots(parsedDoctorId, dateString);
          console.log("Time slots received:", slotsResponse);
          
          // Map responses to standardize property names (handling both camelCase and lowercase variations)
          const normalizedSlots = slotsResponse.map(slot => {
            // Create a new object with standardized properties
            return {
              doctorID: slot.doctorID || slot.doctorid,
              doctorid: slot.doctorID || slot.doctorid,
              startTime: slot.startTime || slot.starttime,
              starttime: slot.startTime || slot.starttime,
              endTime: slot.endTime || slot.endtime,
              endtime: slot.endTime || slot.endtime
            };
          });
          
          console.log("Normalized time slots:", normalizedSlots);
          setTimeSlots(normalizedSlots);
        } catch (error) {
          console.error("Error fetching time slots:", error);
          // If there's an error, set an empty array to show a message to the user
          setTimeSlots([]);
          toast({
            title: "Error",
            description: "Could not load time slots for this date",
            variant: "destructive"
          });
        }
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

    const parsedDoctorId = parseInt(doctorId);
    if (isNaN(parsedDoctorId)) {
      console.error("Invalid doctor ID for booking:", doctorId);
      toast({
        title: "Error",
        description: "Invalid doctor ID",
        variant: "destructive"
      });
      return;
    }

    setIsBooking(true);
    try {
      console.log("Booking appointment with doctor:", parsedDoctorId);
      console.log("With time slot:", selectedSlot);
      
      // Get startTime and endTime safely from the selected slot
      const startTime = selectedSlot.startTime || selectedSlot.starttime;
      const endTime = selectedSlot.endTime || selectedSlot.endtime;
      
      if (!startTime || !endTime) {
        console.error("Invalid time slot selected:", selectedSlot);
        toast({
          title: "Booking Failed",
          description: "Invalid time slot selected",
          variant: "destructive"
        });
        return;
      }
      
      try {
        await appointmentApi.bookAppointment(
          parsedDoctorId,
          startTime,
          endTime
        );
        
        toast({
          title: "Success",
          description: "Appointment booked successfully",
        });
        
        navigate('/dashboard');
      } catch (bookingError) {
        console.error("Error in booking API call:", bookingError);
        toast({
          title: "Booking Failed",
          description: "There was an error booking your appointment. Please try again.",
          variant: "destructive"
        });
      }
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
                      {doctor.profileImage ? (
                        <img 
                          src={doctor.profileImage} 
                          alt={doctor.name} 
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-medisync-purple/20 flex items-center justify-center text-medisync-purple text-lg font-bold">
                          {doctor.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{doctor.name}</h3>
                        <p className="text-sm text-gray-500">{doctor.specialization}</p>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <p className="text-sm text-gray-600 mb-4">
                      {doctor.experience ? 
                        `Specialized in ${doctor.specialization.toLowerCase()} health with ${doctor.experience} of experience.` : 
                        `Experienced specialist with ${doctor.appointmentCount}+ appointments.`
                      }
                    </p>
                    
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
                      
                      {doctor.fee && (
                        <div>
                          <p className="text-sm text-gray-500">Consultation Fee</p>
                          <div className="flex items-center mt-1 text-medisync-purple">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <p className="font-semibold">${doctor.fee}</p>
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-sm text-gray-500">Experience</p>
                        <p className="font-semibold mt-1">
                          {doctor.experience || `${doctor.appointmentCount}+ appointments`}
                        </p>
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
                ) : (
                  <>
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
                    
                    {selectedDate && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-md">
                        <h3 className="font-medium text-gray-700">
                          Available time slots for {format(selectedDate, 'MMMM d, yyyy')}
                        </h3>
                        {timeSlots.length > 0 ? (
                          <p className="text-sm text-gray-500 mt-1">
                            Select a convenient time slot below
                          </p>
                        ) : (
                          <p className="text-sm text-yellow-700 mt-1">
                            No available slots on this date. Please select another date.
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
