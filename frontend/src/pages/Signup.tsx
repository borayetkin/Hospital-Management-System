import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";
import { User, UserRole } from '@/types';
import { authService } from '@/services/authService';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [staffRole, setStaffRole] = useState('');
  const [dob, setDob] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (role === 'patient' && !dob) {
      toast.error('Date of birth is required for patients');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await authService.signup({
        name,
        email,
        identity_number: identityNumber,
        password,
        role,
        phone_number: phoneNumber,
        specialization,
        staff_role: staffRole,
        dob: role === 'patient' ? dob : undefined
      });

      const user: User = {
        userID: response.user_id,
        name,
        email,
        identityNumber,
        role
      };
      
      signup(user);
      navigate('/login');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error instanceof Error ? error.message : 'Signup failed');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-[calc(100vh-theme(spacing.16))] flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">I am a:</Label>
              <RadioGroup 
                id="role" 
                value={role} 
                onValueChange={(value) => setRole(value as UserRole)}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="patient" id="patient" />
                  <Label htmlFor="patient" className="cursor-pointer">Patient</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="doctor" id="doctor" />
                  <Label htmlFor="doctor" className="cursor-pointer">Doctor</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="staff" id="staff" />
                  <Label htmlFor="staff" className="cursor-pointer">Hospital Staff</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin" className="cursor-pointer">Admin</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="Enter your full name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="identityNumber">Identity Number</Label>
              <Input 
                id="identityNumber" 
                placeholder="Enter your identity number" 
                value={identityNumber}
                onChange={(e) => setIdentityNumber(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {role === 'patient' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input 
                    id="phoneNumber" 
                    placeholder="Enter your phone number" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input 
                    id="dob" 
                    type="date" 
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {role === 'doctor' && (
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input 
                  id="specialization" 
                  placeholder="Enter your specialization" 
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  required
                />
              </div>
            )}

            {role === 'staff' && (
              <div className="space-y-2">
                <Label htmlFor="staffRole">Staff Role</Label>
                <Input 
                  id="staffRole" 
                  placeholder="Enter your staff role" 
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Create a password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                placeholder="Confirm your password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{' '}
              <Button variant="link" className="p-0 h-auto text-primary" onClick={() => navigate('/login')}>
                Sign In
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Signup;
