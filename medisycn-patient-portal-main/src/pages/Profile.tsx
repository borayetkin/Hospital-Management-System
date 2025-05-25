import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { patientApi } from '@/api';
import { PatientProfile } from '@/types';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Profile = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingFunds, setIsAddingFunds] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: ''
  });

  const [fundAmount, setFundAmount] = useState<number>(0);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const profileData = await patientApi.getProfile();
        setProfile(profileData);
        setFormData({
          name: profileData.name,
          email: profileData.email,
          phoneNumber: profileData.phoneNumber
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    setIsSaving(true);
    try {
      const updatedProfile = await patientApi.updateProfile(formData);
      setProfile(updatedProfile);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFunds = async () => {
    if (!profile || fundAmount <= 0) return;

    setIsAddingFunds(true);
    try {
      const updatedProfile = await patientApi.addFunds(fundAmount);
      setProfile(updatedProfile);
      setFundAmount(0);
      toast({
        title: "Success",
        description: `$${fundAmount} added to your account balance`,
      });
    } catch (error) {
      console.error('Error adding funds:', error);
      toast({
        title: "Transaction Failed",
        description: "Failed to add funds to your account",
        variant: "destructive"
      });
    } finally {
      setIsAddingFunds(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="payment">Payment & Billing</TabsTrigger>
            <TabsTrigger value="settings">Account Settings</TabsTrigger>
          </TabsList>

          {/* Profile Information Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>
                  Manage your personal information
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    value={profile?.dob || ''}
                    disabled
                  />
                  <p className="text-xs text-gray-500">
                    Date of birth cannot be changed. Please contact support if this information is incorrect.
                  </p>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-medisync-purple hover:bg-medisync-purple-dark"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Payment & Billing Tab */}
          <TabsContent value="payment">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Balance</CardTitle>
                  <CardDescription>
                    Add funds to your account
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="bg-medisync-purple/10 p-4 rounded-md">
                    <p className="text-sm text-gray-600">Current Balance</p>
                    <p className="text-3xl font-bold text-medisync-purple-dark">
                      ${profile?.balance.toFixed(2)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fundAmount">Add Funds</Label>
                    <Input
                      id="fundAmount"
                      type="number"
                      min="0"
                      step="10"
                      value={fundAmount === 0 ? '' : fundAmount}
                      onChange={(e) => {
                        // Remove leading zeros
                        const sanitized = e.target.value.replace(/^0+(?=\d)/, '');
                        setFundAmount(sanitized === '' ? 0 : Number(sanitized));
                      }}
                    />
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={handleAddFunds}
                    disabled={isAddingFunds || fundAmount <= 0}
                    className="bg-medisync-purple hover:bg-medisync-purple-dark"
                  >
                    {isAddingFunds ? 'Processing...' : 'Add Funds'}
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Manage your saved payment methods
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-md flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="mr-3">
                        <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Credit Card</p>
                        <p className="text-sm text-gray-500">**** **** **** 4242</p>
                      </div>
                    </div>
                    <div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Payment Method
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Account Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences and settings
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Notification Settings */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Notifications</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <input
                        id="emailNotifications"
                        type="checkbox"
                        checked
                        className="h-4 w-4 text-medisync-purple focus:ring-medisync-purple border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="smsNotifications">SMS Notifications</Label>
                      <input
                        id="smsNotifications"
                        type="checkbox"
                        className="h-4 w-4 text-medisync-purple focus:ring-medisync-purple border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Privacy</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="dataSharing">Data Sharing for Research</Label>
                      <input
                        id="dataSharing"
                        type="checkbox"
                        className="h-4 w-4 text-medisync-purple focus:ring-medisync-purple border-gray-300 rounded"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Allow anonymized data to be used for healthcare research and improvements.
                  </p>
                </div>

                {/* Danger Zone */}
                <div>
                  <h3 className="text-lg font-medium text-red-600 mb-3">Danger Zone</h3>
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Log Out
                    </Button>
                    <p className="text-sm text-gray-500">
                      To delete your account, please contact customer support.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
