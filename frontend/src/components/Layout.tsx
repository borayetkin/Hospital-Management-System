
import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, User, Users, Home, Menu, LogOut, Settings, List, Search, Activity, BarChart2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Sidebar items based on user role
  const getNavItems = () => {
    const commonItems = [
      { icon: Home, label: 'Home', path: '/' },
      { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    if (!user) return commonItems;

    if (user.role === 'patient') {
      return [
        ...commonItems,
        { icon: Users, label: 'Doctors', path: '/doctors' },
        { icon: Calendar, label: 'Appointments', path: '/appointments' },
        { icon: Activity, label: 'Medical Processes', path: '/patient-processes' },
        { icon: CreditCard, label: 'Manage Balance', path: '/settings?tab=balance' },
      ];
    }

    if (user.role === 'doctor') {
      return [
        ...commonItems,
        { icon: Calendar, label: 'Appointments', path: '/doctor-appointments' },
        { icon: Users, label: 'Patients', path: '/doctor-patients' },
        { icon: List, label: 'Resources', path: '/resources' },
      ];
    }

    if (user.role === 'staff') {
      return [
        ...commonItems,
        { icon: List, label: 'Resources', path: '/resources' },
      ];
    }

    if (user.role === 'admin') {
      return [
        ...commonItems,
        { icon: BarChart2, label: 'Reports & Analytics', path: '/admin-reports' },
        { icon: Users, label: 'Doctors', path: '/doctors' },
        { icon: List, label: 'Resources', path: '/resources' },
      ];
    }

    return commonItems;
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-6 bg-white shadow-sm z-10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <SheetHeader>
                <SheetTitle>MediSync</SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-md hover:bg-secondary transition-colors ${
                      location.pathname === item.path ? 'bg-primary text-primary-foreground' : ''
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
                {user && (
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-secondary transition-colors text-left mt-4"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          <Link to="/" className="text-xl font-semibold text-primary">MediSync</Link>
        </div>

        {user ? (
          <div className="flex items-center gap-4">
            {user.role === 'patient' && (
              <span className="text-sm font-medium hidden md:block">
                Balance: ${(user as any).balance}
              </span>
            )}
            <span className="text-sm font-medium hidden md:block">
              {user.name} ({user.role})
            </span>
            <Avatar>
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (desktop only) */}
        <aside className="hidden md:flex w-64 p-4 flex-col border-r">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-md hover:bg-secondary transition-colors ${
                  location.pathname === item.path ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          
          {user && (
            <>
              <Separator className="my-4" />
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-secondary transition-colors text-left mt-auto"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
