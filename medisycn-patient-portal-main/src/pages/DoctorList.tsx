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
import { Switch } from '@/components/ui/switch';

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
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialization, setSpecialization] = useState('All Specializations');
  const [minRating, setMinRating] = useState<number | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        setError(null); // Reset error state
        
        // Mock data for doctors (same as in API)
        const mockDoctors = [
          {
            doctorID: 101,
            name: 'Dr. Emma Smith',
            specialization: 'Cardiology',
            experience: '8+ years',
            fee: 150,
            avgRating: 4.8,
            appointmentCount: 253,
            profileImage: '/doctors/emma-smith.jpg'
          },
          {
            doctorID: 102,
            name: 'Dr. James Wilson',
            specialization: 'Neurology',
            experience: '12+ years',
            fee: 180,
            avgRating: 4.9,
            appointmentCount: 187,
            profileImage: '/doctors/james-wilson.jpg'
          },
          {
            doctorID: 103,
            name: 'Dr. Emily Chen',
            specialization: 'Pediatrics',
            experience: '6+ years',
            fee: 120,
            avgRating: 4.7,
            appointmentCount: 312,
            profileImage: '/doctors/emily-chen.jpg'
          },
          {
            doctorID: 104,
            name: 'Dr. Michael Brown',
            specialization: 'Orthopedics',
            experience: '15+ years',
            fee: 200,
            avgRating: 4.6,
            appointmentCount: 205,
            profileImage: '/doctors/michael-brown.jpg'
          },
          {
            doctorID: 105,
            name: 'Dr. Anna Lee',
            specialization: 'Dermatology',
            experience: '9+ years',
            fee: 160,
            avgRating: 4.8,
            appointmentCount: 178,
            profileImage: '/doctors/anna-lee.jpg'
          }
        ];
        
        let doctorsData;
        
        if (useMockData) {
          console.log("Using local mock data");
          doctorsData = mockDoctors;
        } else {
          console.log("Calling API endpoint");
          doctorsData = await appointmentApi.getDoctors();
          console.log("API Response - Doctors:", doctorsData);
        }
        
        if (doctorsData && Array.isArray(doctorsData)) {
          // Validate the doctor data before setting state
          const validatedDoctors = doctorsData.map(doctor => {
            if (!doctor.doctorID && doctor.doctorID !== 0) {
              console.error("Doctor missing ID:", doctor);
              // Add a temporary ID for debugging
              return { ...doctor, doctorID: Math.floor(Math.random() * 1000) + 300 };
            }
            return doctor;
          });
          
          console.log("Validated doctors:", validatedDoctors);
          setDoctors(validatedDoctors);
          setFilteredDoctors(validatedDoctors);
        } else {
          console.error("Invalid doctors data format:", doctorsData);
          setError("Received invalid data format from server");
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setError("Failed to load doctors. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, [isAuthenticated, navigate, useMockData]);

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

    // Filter by minimum rating (only if not null and greater than 0)
    if (minRating !== null && minRating > 0) {
      result = result.filter(doctor => doctor.avgRating >= minRating);
    }

    setFilteredDoctors(result);
  }, [searchQuery, specialization, minRating, doctors]);

  const handleDoctorSelect = (doctorId: number) => {
    console.log("Selected doctor ID in DoctorList:", doctorId, typeof doctorId);
    
    if (doctorId === undefined || doctorId === null) {
      console.error("Doctor ID is undefined or null");
      return;
    }
    
    if (isNaN(doctorId)) {
      console.error("Invalid doctor ID selected:", doctorId);
      return;
    }
    
    // Log the actual URL we're navigating to
    const targetUrl = `/book-appointment/${doctorId}`;
    console.log("Navigating to:", targetUrl);
    
    navigate(targetUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Find a Doctor</h1>
          
          {/* Development toggle for mock data */}
          <div className="flex items-center space-x-2">
            <Label htmlFor="mock-data" className="text-sm text-gray-500">Use Mock Data</Label>
            <Switch 
              id="mock-data" 
              checked={useMockData} 
              onCheckedChange={setUseMockData} 
            />
          </div>
        </div>
        
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
                value={minRating !== null ? minRating.toString() : '0'} 
                onValueChange={(val) => setMinRating(val === "0" ? null : Number(val))}
              >
                <SelectTrigger id="rating">
                  <SelectValue placeholder="Any rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any rating</SelectItem>
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
              error ? 'Error loading doctors' :
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
          ) : error ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <h3 className="text-xl font-medium text-gray-900 mb-2">Error</h3>
              <p className="text-gray-500">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor, index) => (
                <div key={doctor.doctorID || `doctor-${index}`} className="relative">
                  {/* Debug overlay - can remove in production */}
                  <div className="absolute top-0 right-0 bg-black text-white text-xs px-2 py-1 z-10 rounded-bl-md opacity-70">
                    ID: {doctor.doctorID !== undefined ? doctor.doctorID : 'undefined'}
                  </div>
                  <DoctorCard 
                    key={doctor.doctorID} 
                    doctor={doctor} 
                    onSelect={handleDoctorSelect} 
                  />
                </div>
              ))}
            </div>
          )}
          
          {!isLoading && !error && filteredDoctors.length === 0 && (
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
