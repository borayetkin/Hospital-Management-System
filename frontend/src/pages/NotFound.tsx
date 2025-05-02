
import React from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-16rem)] flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground">
          The page at <span className="font-mono font-medium">{location.pathname}</span> could not be found.
        </p>
        
        <Button 
          size="lg" 
          onClick={() => navigate('/')}
          className="mt-6"
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
