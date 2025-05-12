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
    // Make sure availableDates array exists before checking includes
    if (!availableDates || !Array.isArray(availableDates)) {
      console.error("availableDates is not a valid array:", availableDates);
      return false;
    }
    
    const dateString = format(date, 'yyyy-MM-dd');
    return availableDates.includes(dateString);
  };

  // Helper function to safely get time value from slot (handling both camelCase and lowercase property names)
  const getTimeValue = (slot: any, camelCaseKey: string, lowercaseKey: string) => {
    // Try camelCase first (e.g., startTime), then lowercase (e.g., starttime)
    return slot[camelCaseKey] || slot[lowercaseKey];
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
              // Get startTime and endTime safely, handling both camelCase and lowercase
              const startTimeStr = getTimeValue(slot, 'startTime', 'starttime');
              const endTimeStr = getTimeValue(slot, 'endTime', 'endtime');
              
              // Skip rendering this slot if time values are missing
              if (!startTimeStr || !endTimeStr) {
                console.error(`Skipping invalid time slot at index ${index}:`, slot);
                return null;
              }
              
              try {
                const startTime = parseISO(startTimeStr);
                const endTime = parseISO(endTimeStr);
                const timeDisplay = `${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}`;
                
                // Check if current slot matches selected slot
                const isSelected = selectedSlot && (
                  (selectedSlot.startTime === slot.startTime && selectedSlot.endTime === slot.endTime) ||
                  (selectedSlot.startTime === slot.starttime && selectedSlot.endTime === slot.endtime) ||
                  (selectedSlot.starttime === slot.startTime && selectedSlot.endtime === slot.endTime) ||
                  (selectedSlot.starttime === slot.starttime && selectedSlot.endtime === slot.endtime)
                );
                
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
              } catch (error) {
                console.error(`Error parsing date at index ${index}:`, error, slot);
                return null; // Skip rendering this slot if there's an error
              }
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
                  {(() => {
                    // Handle both camelCase and lowercase properties
                    const startTimeStr = getTimeValue(selectedSlot, 'startTime', 'starttime');
                    const endTimeStr = getTimeValue(selectedSlot, 'endTime', 'endtime');
                    if (!startTimeStr || !endTimeStr) return 'Invalid time';
                    
                    try {
                      return `${format(parseISO(startTimeStr), 'h:mm a')} - ${format(parseISO(endTimeStr), 'h:mm a')}`;
                    } catch (error) {
                      console.error('Error formatting selected time:', error);
                      return 'Invalid time';
                    }
                  })()}
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
