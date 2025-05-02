import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Package, Clock, Building2, Users } from 'lucide-react';
import { toast } from "sonner";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { MedicalResource, ResourceFilterParams } from '@/types';

const resourceTypes = [
  'All',
  'Imaging',
  'Diagnostic',
  'Life Support',
  'Surgical',
];

const departments = [
  'All',
  'Radiology',
  'Cardiology',
  'ICU',
  'Surgery',
  'Obstetrics',
];

const timeSlots = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
];

const Resources = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState<MedicalResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [resourceType, setResourceType] = useState('All');
  const [department, setDepartment] = useState('All');
  const [availableOnly, setAvailableOnly] = useState(false);
  
  // Reservation states
  const [selectedResource, setSelectedResource] = useState<MedicalResource | null>(null);
  const [reservationDialogOpen, setReservationDialogOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [quantity, setQuantity] = useState(1);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    // Changed condition to allow admins to access this page
    if (!user || (user.role !== 'doctor' && user.role !== 'staff' && user.role !== 'admin')) {
      navigate('/login');
      return;
    }

    const fetchResources = async () => {
      setLoading(true);
      try {
        const filters: ResourceFilterParams = {};
        
        if (resourceType !== 'All') {
          filters.type = resourceType;
        }
        
        if (department !== 'All') {
          filters.department = department;
        }
        
        if (availableOnly) {
          filters.availableOnly = true;
        }
        
        const resourcesData = await dataService.getResources(filters);
        setResources(resourcesData);
      } catch (error) {
        console.error('Error fetching resources:', error);
        toast.error('Failed to load resources');
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [user, navigate, resourceType, department, availableOnly]);

  const handleReserveClick = (resource: MedicalResource) => {
    setSelectedResource(resource);
    setDate(undefined);
    setStartTime('09:00');
    setEndTime('10:00');
    setQuantity(1);
    setReservationDialogOpen(true);
  };

  const handleReserve = async () => {
    if (!selectedResource || !date || !user) {
      toast.error('Please fill all required fields');
      return;
    }

    if (selectedResource.quantity < quantity) {
      toast.error(`Only ${selectedResource.quantity} units available`);
      return;
    }

    setReserving(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      await dataService.reserveResource(
        selectedResource.id,
        user.id,
        user.role as 'doctor' | 'staff',
        formattedDate,
        startTime,
        endTime,
        quantity
      );

      toast.success('Resource reserved successfully');
      setReservationDialogOpen(false);
      
      // Refetch resources to update availability
      const updatedResources = await dataService.getResources();
      setResources(updatedResources);
    } catch (error) {
      console.error('Error reserving resource:', error);
      toast.error('Failed to reserve resource');
    } finally {
      setReserving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Medical Resources</h1>
      </div>
      
      {/* Filters */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Filter Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Resource Type</Label>
              <Select value={resourceType} onValueChange={setResourceType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {resourceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="availableOnly" 
                  checked={availableOnly} 
                  onCheckedChange={(checked) => setAvailableOnly(checked as boolean)}
                />
                <Label htmlFor="availableOnly" className="cursor-pointer">
                  Show available resources only
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Resources List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          // Loading skeletons
          [...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
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
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))
        ) : resources.length === 0 ? (
          <div className="col-span-full text-center py-12 border rounded-lg bg-muted/10">
            <h3 className="text-lg font-medium mb-2">No resources found</h3>
            <p className="text-muted-foreground mb-6">No resources match your current filters.</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setResourceType('All');
                setDepartment('All');
                setAvailableOnly(false);
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          resources.map((resource) => (
            <Card key={resource.id} className="card-hover">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{resource.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{resource.type}</Badge>
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={resource.isAvailable ? "success" : "destructive"} 
                    className={`${resource.isAvailable ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                  >
                    {resource.isAvailable ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>Department: {resource.department}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>Quantity: {resource.quantity}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  disabled={!resource.isAvailable || user.role === 'admin'}
                  onClick={() => handleReserveClick(resource)}
                >
                  Reserve Resource
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
      
      {/* Reservation Dialog */}
      <Dialog open={reservationDialogOpen} onOpenChange={setReservationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reserve {selectedResource?.name}</DialogTitle>
            <DialogDescription>
              Complete the form below to reserve this resource
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="reservation-date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="reservation-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Select date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger id="start-time">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.slice(0, -1).map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger id="end-time">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.slice(1).map((time) => (
                      <SelectItem 
                        key={time} 
                        value={time}
                        disabled={timeSlots.indexOf(time) <= timeSlots.indexOf(startTime)}
                      >
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <div className="flex items-center">
                <Input 
                  id="quantity" 
                  type="number" 
                  min={1} 
                  max={selectedResource?.quantity || 1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-24"
                />
                <span className="ml-2 text-sm text-muted-foreground">
                  Maximum: {selectedResource?.quantity || 0}
                </span>
              </div>
            </div>
            
            <div className="rounded-md bg-muted p-4 text-sm">
              <div className="font-medium">Reservation Summary</div>
              <Separator className="my-2" />
              <div className="grid grid-cols-2 gap-2">
                <div className="text-muted-foreground">Resource:</div>
                <div>{selectedResource?.name}</div>
                <div className="text-muted-foreground">Department:</div>
                <div>{selectedResource?.department}</div>
                <div className="text-muted-foreground">Date:</div>
                <div>{date ? format(date, 'PPP') : 'Not selected'}</div>
                <div className="text-muted-foreground">Time:</div>
                <div>{startTime} - {endTime}</div>
                <div className="text-muted-foreground">Quantity:</div>
                <div>{quantity}</div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReservationDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleReserve} disabled={reserving || !date}>
              {reserving ? 'Reserving...' : 'Confirm Reservation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Resources;
