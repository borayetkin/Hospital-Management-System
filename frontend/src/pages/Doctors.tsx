
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Star, Search, UserPlus, UserCheck, Users } from 'lucide-react';
import { toast } from "sonner";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { Doctor } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

const Doctors = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [favoriteDoctors, setFavoriteDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    // Updated to allow both patients and admins to access this page
    if (!user || (user.role !== 'patient' && user.role !== 'admin')) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const doctorsData = await dataService.getDoctors();
        setDoctors(doctorsData);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        toast.error('Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Only fetch favorites for patients, not for admins
    if (user.role === 'patient') {
      fetchFavoriteDoctors();
    }
  }, [user, navigate]);

  // Fix the specific methods causing the build errors
  const fetchFavoriteDoctors = async () => {
    setLoading(true);
    try {
      // Since getFavoriteDoctors doesn't exist, modify this to use a different approach
      // For example, just fetch all doctors and filter locally
      const doctorsData = await dataService.getDoctors();
      // Here we're simulating "favorite" doctors - in a real app this would use a favorites system
      setFavoriteDoctors(doctorsData.slice(0, 3)); // Just take the first 3 as sample favorites
    } catch (error) {
      console.error('Error fetching favorite doctors:', error);
      toast.error('Failed to load favorite doctors');
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isFavorite = (doctorId: string) => {
    return favoriteDoctors.some(doctor => doctor.id === doctorId);
  };

  const toggleFavorite = async (doctor: Doctor) => {
    if (isFavorite(doctor.id)) {
      try {
        // Since removeFavoriteDoctor doesn't exist, handle this locally
        // In a real app, this would make an API call
        setFavoriteDoctors(favoriteDoctors.filter(d => d.id !== doctor.id));
        toast.success(`Removed ${doctor.name} from favorites`);
      } catch (error) {
        console.error('Error removing from favorites:', error);
        toast.error('Failed to remove from favorites');
      }
    } else {
      try {
        // Since addFavoriteDoctor doesn't exist, handle this locally
        // In a real app, this would make an API call
        setFavoriteDoctors([...favoriteDoctors, doctor]);
        toast.success(`Added ${doctor.name} to favorites`);
      } catch (error) {
        console.error('Error adding to favorites:', error);
        toast.error('Failed to add to favorites');
      }
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setIsDatePickerOpen(false);
  };

  const handleBookAppointment = (doctorId: string) => {
    // For admin, don't navigate to book appointment
    if (user?.role === 'admin') {
      toast.info("Admins cannot book appointments");
      return;
    }
    navigate(`/book-appointment/${doctorId}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Our Doctors</h1>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Search doctors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="md:w-auto"
        />
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading skeletons
          [...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))
        ) : filteredDoctors.length === 0 ? (
          <div className="col-span-3 text-center py-12">
            <h3 className="text-lg font-medium">No doctors found</h3>
            <p className="text-muted-foreground">
              We couldn't find any doctors matching your search criteria.
            </p>
          </div>
        ) : (
          filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="card-hover">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={doctor.avatar} />
                  <AvatarFallback>{getInitials(doctor.name)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold">{doctor.name}</CardTitle>
                  <CardDescription>{doctor.specialization}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 text-sm">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{doctor.rating} Rating</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => handleBookAppointment(doctor.id)}>
                  {user?.role === 'admin' ? 'View Details' : 'Book Appointment'}
                </Button>
                {user?.role === 'patient' && (
                  <Button
                    variant="ghost"
                    onClick={() => toggleFavorite(doctor)}
                  >
                    {isFavorite(doctor.id) ? (
                      <UserCheck className="h-4 w-4 text-blue-500" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {user?.role === 'patient' && favoriteDoctors.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Favorite Doctors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteDoctors.map((doctor) => (
              <Card key={doctor.id} className="card-hover">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={doctor.avatar} />
                    <AvatarFallback>{getInitials(doctor.name)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold">{doctor.name}</CardTitle>
                    <CardDescription>{doctor.specialization}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{doctor.rating} Rating</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => handleBookAppointment(doctor.id)}>
                    Book Appointment
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => toggleFavorite(doctor)}
                  >
                    {isFavorite(doctor.id) ? (
                      <UserCheck className="h-4 w-4 text-blue-500" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;
