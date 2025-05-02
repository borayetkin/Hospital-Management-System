import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { User, Patient, Doctor, Staff, Admin, UserRole } from '../types';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  signup: (user: User) => void;
  logout: () => void;
  updateUserBalance: (amount: number) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('hospitalUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (user: User) => {
    setUser(user);
    localStorage.setItem('hospitalUser', JSON.stringify(user));
    toast.success(`Welcome back, ${user.name}!`);
  };

  const signup = (user: User) => {
    setUser(user);
    localStorage.setItem('hospitalUser', JSON.stringify(user));
    toast.success('Account created successfully!');
  };

  const updateUserBalance = (amount: number) => {
    if (!user || user.role !== 'patient') return;
    
    const updatedUser = {
      ...user,
      Balance: (user as Patient).Balance + amount
    } as Patient;
    
    setUser(updatedUser);
    localStorage.setItem('hospitalUser', JSON.stringify(updatedUser));
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
      updateUserBalance
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
