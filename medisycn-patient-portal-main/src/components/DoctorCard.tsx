
import { DoctorProfile } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DoctorCardProps {
  doctor: DoctorProfile;
  onSelect: (doctorId: number) => void;
}

const DoctorCard = ({ doctor, onSelect }: DoctorCardProps) => {
  return (
    <Card className="overflow-hidden card-hover">
      <CardHeader className="p-6 pb-0">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-medisync-purple/20 flex items-center justify-center text-medisync-purple text-lg font-bold">
            {doctor.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{doctor.name}</h3>
            <p className="text-sm text-gray-500">{doctor.specialization}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4 mt-2">
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
      </CardContent>
      
      <CardFooter className="p-6 pt-0">
        <Button 
          onClick={() => onSelect(doctor.doctorID)}
          className="w-full bg-medisync-purple hover:bg-medisync-purple-dark"
        >
          Book Appointment
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DoctorCard;
