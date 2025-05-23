import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api";
import { User, AuthResponse } from "../types";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  verifyToken: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Verify if the token exists and is valid
  const verifyToken = (): boolean => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      return false;
    }

    try {
      // Check token format (should be a JWT with 3 parts separated by dots)
      const parts = token.split(".");
      if (parts.length !== 3) {
        console.warn("Invalid token format");
        return false;
      }

      // Parse user to make sure it's valid JSON
      JSON.parse(storedUser);
      return true;
    } catch (error) {
      console.error("Error verifying token:", error);
      return false;
    }
  };

  useEffect(() => {
    // Check for stored user data on initial load
    const isValid = verifyToken();

    if (isValid) {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          console.log(
            "Auth initialized with user:",
            parsedUser.name,
            "Role:",
            parsedUser.role
          );
        }
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    } else {
      // Remove invalid data
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response: AuthResponse = await authApi.login(email, password);

      if (!response.access_token) {
        throw new Error("No access token received");
      }

      setUser(response.user);
      localStorage.setItem("token", response.access_token);
      localStorage.setItem("user", JSON.stringify(response.user));

      console.log(
        "Login successful. Token saved, User:",
        response.user.name,
        "Role:",
        response.user.role
      );

      toast({
        title: "Login Successful",
        description: `Welcome back, ${response.user.name}!`,
      });
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(userData);
      toast({
        title: "Registration Successful",
        description: "Your account has been created. Please login.",
      });
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description:
          "There was an error during registration. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        verifyToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
