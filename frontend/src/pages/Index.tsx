
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, User, FileCheck, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center mb-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Streamlined Healthcare <span className="text-primary">Management</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Simplify appointments, optimize resources, and enhance patient experiences with our intuitive hospital management system.
          </p>
          
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                Learn More
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user.role === 'patient' && (
                <Button size="lg" onClick={() => navigate('/doctors')}>
                  Book Appointment
                </Button>
              )}
              {user.role === 'doctor' && (
                <Button size="lg" onClick={() => navigate('/doctor-appointments')}>
                  View Appointments
                </Button>
              )}
              {user.role === 'staff' && (
                <Button size="lg" onClick={() => navigate('/resources')}>
                  Manage Resources
                </Button>
              )}
            </div>
          )}
        </div>
      </section>
      
      {/* Features */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-center">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<Calendar className="h-8 w-8 text-primary" />}
            title="Appointment Booking"
            description="Easily book appointments with preferred doctors based on specialization and availability."
          />
          <FeatureCard 
            icon={<User className="h-8 w-8 text-primary" />}
            title="Doctor Selection"
            description="Browse and filter doctors by specialization, ratings, and experience."
          />
          <FeatureCard 
            icon={<FileCheck className="h-8 w-8 text-primary" />}
            title="Review System"
            description="Leave and view reviews to help others choose the right healthcare provider."
          />
          <FeatureCard 
            icon={<Clock className="h-8 w-8 text-primary" />}
            title="Resource Allocation"
            description="Efficiently manage and schedule medical resources and equipment."
          />
          <FeatureCard 
            icon={<Shield className="h-8 w-8 text-primary" />}
            title="Secure Payments"
            description="Safe and transparent payment processing for medical services."
          />
        </div>
      </section>
      
      {/* How It Works */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-primary font-medium">1</span>
            </div>
            <h3 className="text-lg font-medium mb-2">Find a Doctor</h3>
            <p className="text-muted-foreground">Browse specialists based on your needs and check their availability.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-primary font-medium">2</span>
            </div>
            <h3 className="text-lg font-medium mb-2">Book an Appointment</h3>
            <p className="text-muted-foreground">Select a convenient time slot and confirm your appointment.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-primary font-medium">3</span>
            </div>
            <h3 className="text-lg font-medium mb-2">Get Care & Review</h3>
            <p className="text-muted-foreground">Receive quality care and share your experience to help others.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
  return (
    <Card className="card-hover">
      <CardHeader>
        <div className="mb-2">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
};

export default Index;
