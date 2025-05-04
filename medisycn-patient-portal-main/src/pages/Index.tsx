
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-medisync-light-gray">
      <Navbar />
      
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="animate-fade-in">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
            Your Health, <span className="text-medisync-purple">Our Priority</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Experience seamless healthcare management with MediSync - Book appointments, 
            track medical history, and connect with healthcare professionals all in one place.
          </p>
          
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button 
              onClick={() => navigate('/register')} 
              size="lg"
              className="bg-medisync-purple hover:bg-medisync-purple-dark px-8"
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/login')}
              size="lg"
              className="px-8"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-medisync-purple/10 to-medisync-purple/5 p-6 rounded-xl shadow-sm">
              <div className="h-12 w-12 bg-medisync-purple/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-medisync-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Appointment Booking</h3>
              <p className="text-gray-600">Book appointments with your preferred doctors in just a few clicks. Choose from available time slots that work best for you.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-medisync-purple/10 to-medisync-purple/5 p-6 rounded-xl shadow-sm">
              <div className="h-12 w-12 bg-medisync-purple/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-medisync-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Appointment History</h3>
              <p className="text-gray-600">Keep track of your past appointments and upcoming schedules all in one centralized dashboard.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-medisync-purple/10 to-medisync-purple/5 p-6 rounded-xl shadow-sm">
              <div className="h-12 w-12 bg-medisync-purple/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-medisync-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Doctor Profiles</h3>
              <p className="text-gray-600">Browse through comprehensive doctor profiles with specializations, ratings, and patient reviews to make informed decisions.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-gradient-to-r from-medisync-purple to-medisync-purple-dark py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to experience better healthcare?</h2>
          <p className="text-white/90 text-xl mb-8">Join thousands of patients who have simplified their healthcare journey with MediSync.</p>
          <Button 
            onClick={() => navigate('/register')} 
            size="lg" 
            variant="secondary"
            className="font-medium px-8"
          >
            Create Your Account
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} MediSync. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
