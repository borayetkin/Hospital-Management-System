
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { appointmentApi } from '@/api';
import { DoctorProfile } from '@/types';
import Navbar from '@/components/Navbar';
import DoctorCard from '@/components/DoctorCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

const specializations = [
  'All Specializations',
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'Dermatology',
  'Ophthalmology',
  'Internal Medicine',
  'Psychiatry',
  'Gynecology'
];

const DoctorList = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialization, setSpecialization] = useState('All Specializations');
  const [minRating, setMinRating] = useState<number | undefined>(undefined);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        const doctorsData = await appointmentApi.getDoctors();
        setDoctors(doctorsData);
        setFilteredDoctors(doctorsData);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Apply filters whenever search query or filters change
    let result = doctors;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(doctor => 
        doctor.name.toLowerCase().includes(query) || 
        doctor.specialization.toLowerCase().includes(query)
      );
    }

    // Filter by specialization
    if (specialization && specialization !== 'All Specializations') {
      result = result.filter(doctor => doctor.specialization === specialization);
    }

    // Filter by minimum rating
    if (minRating !== undefined) {
      result = result.filter(doctor => doctor.avgRating >= minRating);
    }

    setFilteredDoctors(result);
  }, [searchQuery, specialization, minRating, doctors]);

  const handleDoctorSelect = (doctorId: number) => {
    navigate(`/book-appointment/${doctorId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Find a Doctor</h1>
        
        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div className="relative">
              <Label htmlFor="search" className="mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by name or specialization"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Specialization Filter */}
            <div>
              <Label htmlFor="specialization" className="mb-2 block">Specialization</Label>
              <Select 
                value={specialization} 
                onValueChange={setSpecialization}
              >
                <SelectTrigger id="specialization">
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  {specializations.map(spec => (
                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Rating Filter */}
            <div>
              <Label htmlFor="rating" className="mb-2 block">Minimum Rating</Label>
              <Select 
                value={minRating?.toString() || ''} 
                onValueChange={(val) => setMinRating(val ? Number(val) : undefined)}
              >
                <SelectTrigger id="rating">
                  <SelectValue placeholder="Any rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any rating</SelectItem>
                  <SelectItem value="4">4+ stars</SelectItem>
                  <SelectItem value="4.5">4.5+ stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Results */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {isLoading ? 'Loading doctors...' : (
              filteredDoctors.length > 0 
                ? `${filteredDoctors.length} doctors found` 
                : 'No doctors match your search'
            )}
          </h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6 h-64 animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="rounded-full bg-gray-200 h-16 w-16"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-10 bg-gray-200 rounded"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map(doctor => (
                <DoctorCard 
                  key={doctor.doctorID} 
                  doctor={doctor} 
                  onSelect={handleDoctorSelect} 
                />
              ))}
            </div>
          )}
          
          {!isLoading && filteredDoctors.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <h3 className="text-xl font-medium text-gray-900 mb-2">No doctors found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorList;
