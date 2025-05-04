
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { TimeSlot } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface BookingCalendarProps {
  availableDates: string[];
  onSelectDate: (date: Date) => void;
  selectedDate: Date | undefined;
  timeSlots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const BookingCalendar = ({
  availableDates,
  onSelectDate,
  selectedDate,
  timeSlots,
  selectedSlot,
  onSelectSlot,
  onConfirm,
  isLoading
}: BookingCalendarProps) => {
  // Convert string dates to Date objects for the calendar component
  const disabledDates = {
    before: new Date(),
    after: new Date(new Date().setMonth(new Date().getMonth() + 3))
  };

  // Function to check if a date is available
  const isDateAvailable = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return availableDates.includes(dateString);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Select a Date</h3>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onSelectDate}
          disabled={[
            (date) => !isDateAvailable(date),
            disabledDates
          ]}
          className={cn("p-3 pointer-events-auto rounded-md border bg-white")}
        />
      </div>

      {selectedDate && timeSlots.length > 0 && (
        <div className="space-y-4 mt-6 animate-fade-in">
          <h3 className="text-lg font-semibold">Available Time Slots</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {timeSlots.map((slot, index) => {
              const startTime = parseISO(slot.startTime);
              const endTime = parseISO(slot.endTime);
              const timeDisplay = `${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}`;
              
              const isSelected = selectedSlot && 
                selectedSlot.startTime === slot.startTime && 
                selectedSlot.endTime === slot.endTime;
              
              return (
                <Button
                  key={index}
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "h-auto py-3",
                    isSelected ? "bg-medisync-purple hover:bg-medisync-purple-dark" : ""
                  )}
                  onClick={() => onSelectSlot(slot)}
                >
                  {timeDisplay}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {selectedSlot && (
        <div className="animate-fade-in">
          <Card className="p-4 bg-medisync-green border-green-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Selected Appointment:</p>
                <p className="text-sm text-gray-600">
                  {selectedDate && format(selectedDate, 'MMMM d, yyyy')} at{' '}
                  {format(parseISO(selectedSlot.startTime), 'h:mm a')} - {format(parseISO(selectedSlot.endTime), 'h:mm a')}
                </p>
              </div>
              <Button 
                onClick={onConfirm} 
                disabled={isLoading}
                className="bg-medisync-purple hover:bg-medisync-purple-dark"
              >
                {isLoading ? "Booking..." : "Confirm Booking"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {selectedDate && timeSlots.length === 0 && (
        <div className="p-4 text-center bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800">No available time slots for the selected date.</p>
          <p className="text-sm text-yellow-600 mt-1">Please select another date.</p>
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;
