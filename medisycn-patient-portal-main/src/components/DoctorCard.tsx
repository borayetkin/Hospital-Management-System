import { DoctorProfile } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DoctorCardProps {
  doctor: DoctorProfile;
  onSelect: (doctorId: number) => void;
}

const DoctorCard = ({ doctor, onSelect }: DoctorCardProps) => {
  console.log("Rendering doctor raw:", doctor);
  
  // Validate the doctor object immediately
  useEffect(() => {
    if (!doctor) {
      console.error("Doctor object is null or undefined");
    } else if (doctor.doctorID === undefined) {
      console.error("Doctor object missing doctorID:", doctor);
    }
  }, [doctor]);
  
  const [imageError, setImageError] = useState(false);
  
  // Handle potentially missing data with defaults, but explicitly preserve doctorID as-is
  const {
    doctorID,
    name = 'Unknown Doctor',
    specialization = 'General Practice',
    avgRating = 0,
    appointmentCount = 0,
    experience,
    fee,
    profileImage
  } = doctor || {};
  
  // Log doctor ID specifically
  console.log("Doctor ID in card:", doctorID, typeof doctorID);
  
  // Handle missing initials
  const initials = name.split(' ')
    .map(n => n[0])
    .filter(Boolean)
    .join('') || 'DR';
    
  const handleBookClick = () => {
    console.log("Book button clicked for doctor ID:", doctorID, typeof doctorID);
    console.log("Complete doctor object:", JSON.stringify(doctor, null, 2));
    
    // Ensure we have a valid doctor ID
    if (doctorID === undefined || doctorID === null) {
      console.error("Missing doctor ID, cannot book appointment");
      // For debugging purposes, set a fallback ID if needed
      // Uncomment the next line to use a fallback ID (e.g., for testing)
      // const fallbackId = 101;
      // onSelect(fallbackId);
      return;
    }
    
    onSelect(doctorID);
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-6 pb-0">
        <div className="flex items-center gap-4">
          {profileImage && !imageError ? (
            <img 
              src={profileImage} 
              alt={name} 
              className="h-16 w-16 rounded-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-lg font-bold">
              {initials}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <p className="text-sm text-gray-500">{specialization}</p>
            {doctorID !== undefined ? (
              <p className="text-xs text-gray-400">ID: {doctorID}</p>
            ) : (
              <p className="text-xs text-red-500">Missing ID</p>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <p className="text-sm text-gray-600 mb-4">
          {experience ? 
            `Specialized in ${specialization.toLowerCase()} health with ${experience} of experience.` : 
            `Experienced specialist with ${appointmentCount}+ appointments.`
          }
        </p>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 mr-1" />
            <span className="font-semibold mr-1">{avgRating.toFixed(1)}</span>
          </div>
          
          {fee && (
            <div className="flex items-center text-purple-600">
              <DollarSign className="h-4 w-4 mr-1" />
              <span className="font-semibold">${fee} per visit</span>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-600">Available on:</p>
          <div className="flex flex-wrap mt-1 gap-2">
            <div className="px-2 py-1 text-xs bg-gray-100 rounded">Monday</div>
            <div className="px-2 py-1 text-xs bg-gray-100 rounded">Tuesday</div>
            <div className="px-2 py-1 text-xs bg-gray-100 rounded">Wednesday</div>
            <div className="px-2 py-1 text-xs bg-gray-100 rounded">Friday</div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0">
        <Button 
          onClick={handleBookClick}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          disabled={doctorID === undefined || doctorID === null}
        >
          {doctorID !== undefined && doctorID !== null ? 'Book Appointment' : 'ID Missing (Cannot Book)'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DoctorCard;
