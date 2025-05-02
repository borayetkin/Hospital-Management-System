
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { User, Patient, Doctor, Staff } from '../types';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: 'patient' | 'doctor' | 'staff' | 'admin') => Promise<void>;
  signup: (name: string, email: string, password: string, role: 'patient' | 'doctor' | 'staff') => Promise<void>;
  logout: () => void;
  updateUserBalance?: (amount: number) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for demonstration
const MOCK_PATIENTS: Patient[] = [
  {
    id: 'p1',
    name: 'John Doe',
    email: 'patient@example.com',
    role: 'patient',
    balance: 1000,
    phoneNumber: '123-456-7890',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
];

const MOCK_DOCTORS: Doctor[] = [
  {
    id: 'd1',
    name: 'Dr. Emma Smith',
    email: 'doctor@example.com',
    role: 'doctor',
    specialization: 'Cardiology',
    rating: 4.8,
    experience: 8,
    bio: 'Specialized in cardiovascular health with 8+ years of experience.',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Friday'],
    price: 150,
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
];

const MOCK_STAFF: Staff[] = [
  {
    id: 's1',
    name: 'Sarah Johnson',
    email: 'staff@example.com',
    role: 'staff',
    department: 'Radiology',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
];

const MOCK_ADMIN: User = {
  id: 'a1',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
  avatar: 'https://randomuser.me/api/portraits/men/10.jpg',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for stored user data on initial load
    const storedUser = localStorage.getItem('hospitalUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: 'patient' | 'doctor' | 'staff' | 'admin') => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let foundUser = null;
      
      if (role === 'patient') {
        foundUser = MOCK_PATIENTS.find(p => p.email === email);
      } else if (role === 'doctor') {
        foundUser = MOCK_DOCTORS.find(d => d.email === email);
      } else if (role === 'staff') {
        foundUser = MOCK_STAFF.find(s => s.email === email);
      } else if (role === 'admin') {
        if (email === MOCK_ADMIN.email) {
          foundUser = MOCK_ADMIN;
        }
      }
      
      if (foundUser && password === 'password') { // Simple password check for demo
        setUser(foundUser);
        localStorage.setItem('hospitalUser', JSON.stringify(foundUser));
        toast.success(`Welcome back, ${foundUser.name}!`);
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: 'patient' | 'doctor' | 'staff') => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email already exists
      const emailExists = [
        ...MOCK_PATIENTS, 
        ...MOCK_DOCTORS, 
        ...MOCK_STAFF,
        MOCK_ADMIN
      ].some(user => user.email === email);
      
      if (emailExists) {
        toast.error('Email already exists');
        setIsLoading(false);
        return;
      }
      
      // Create new user based on role
      let newUser: User;
      
      if (role === 'patient') {
        newUser = {
          id: `p${Date.now()}`,
          name,
          email,
          role: 'patient',
          balance: 0,
          phoneNumber: '',
        } as Patient;
        MOCK_PATIENTS.push(newUser as Patient);
      } else if (role === 'doctor') {
        newUser = {
          id: `d${Date.now()}`,
          name,
          email,
          role: 'doctor',
          specialization: '',
          rating: 0,
          experience: 0,
          bio: '',
          availableDays: ['Monday'],
          price: 0,
        } as Doctor;
        MOCK_DOCTORS.push(newUser as Doctor);
      } else {
        newUser = {
          id: `s${Date.now()}`,
          name,
          email,
          role: 'staff',
          department: '',
        } as Staff;
        MOCK_STAFF.push(newUser as Staff);
      }
      
      // Log in the new user
      setUser(newUser);
      localStorage.setItem('hospitalUser', JSON.stringify(newUser));
      toast.success(`Account created successfully!`);
      
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserBalance = (amount: number) => {
    if (!user || user.role !== 'patient') return;
    
    const updatedUser = { 
      ...user, 
      balance: (user as Patient).balance + amount 
    } as Patient;
    
    setUser(updatedUser);
    localStorage.setItem('hospitalUser', JSON.stringify(updatedUser));
    
    toast.success(`Balance updated successfully! New balance: $${updatedUser.balance}`);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hospitalUser');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      signup, 
      logout, 
      ...(user?.role === 'patient' ? { updateUserBalance } : {})
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
