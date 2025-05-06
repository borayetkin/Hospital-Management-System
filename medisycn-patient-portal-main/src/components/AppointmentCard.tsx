import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { Appointment } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppointmentCardProps {
  appointment: Appointment;
  onReview?: (appointmentId: number) => void;
  onCancel?: (appointmentId: number) => void;
}

const AppointmentCard = ({ appointment, onReview, onCancel }: AppointmentCardProps) => {
  const startTime = parseISO(appointment.startTime);
  const endTime = parseISO(appointment.endTime);
  
  // Determine if appointment is in the future
  const isUpcoming = startTime > new Date();
  
  // Format date and time for display
  const dateFormatted = format(startTime, 'MMMM d, yyyy');
  const timeFormatted = `${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}`;
  
  // Set status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader className="bg-gradient-to-r from-medisync-purple/10 to-transparent p-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">{appointment.doctorName || `Doctor #${appointment.doctorID}`}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {isUpcoming 
                ? `Upcoming: ${formatDistanceToNow(startTime, { addSuffix: true })}` 
                : `${formatDistanceToNow(startTime, { addSuffix: true })}`
              }
            </p>
          </div>
          <Badge className={`${getStatusColor(appointment.status)}`}>
            {appointment.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-medisync-purple" />
          <span>{dateFormatted}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-medisync-purple" />
          <span>{timeFormatted}</span>
        </div>
        
        {appointment.rating && (
          <div className="mt-2">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-1">Rating:</span>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg 
                    key={i}
                    className={`h-4 w-4 ${i < appointment.rating! ? "text-yellow-400" : "text-gray-300"}`}
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            {appointment.review && (
              <p className="text-sm text-gray-600 mt-1">{appointment.review}</p>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-end gap-2">
        {appointment.status === 'scheduled' && onCancel && (
          <Button 
            variant="outline" 
            onClick={() => onCancel(appointment.appointmentID)}
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            Cancel
          </Button>
        )}
        {appointment.status === 'completed' && !appointment.rating && onReview && (
          <Button 
            variant="outline"
            onClick={() => onReview(appointment.appointmentID)}
            size="sm"
            className="text-medisync-purple border-medisync-purple/30 hover:bg-medisync-purple/10"
          >
            Leave Review
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default AppointmentCard;
