/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/axios";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";

interface User {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  checkAuth: () => Promise<boolean>;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async (): Promise<boolean> => {
    try {
      const response = await api.get("/auth/check-auth");
      if (response.data.success) {
        setUser(response.data.data.user);
        toast.success("Check auth successfully!");

        return true;
      }
      return false;
    } catch (err: any) {
      setUser(null);

      const error = err as AxiosError<{ message?: string }>;
      const message = error.response?.data?.message || "Check auth failed";
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: any) => {
    try {
      const response = await api.post("/auth/login", data);
      if (response.data.success) {
        setUser(response.data.data.user);
        toast.success("Logged in successful!");

        return true;
      }
      return false;
    } catch (err: any) {
      const error = err as AxiosError<{ message?: string }>;
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);

      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      const response = await api.post("/auth/register", data);
      if (response.data.success) {
        setUser(response.data.data.user);
        toast.success("Registration successful!");

        return true;
      }
      return false;
    } catch (err: any) {
      const error = err as AxiosError<{ message?: string }>;
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      throw error;
    }
  };

  const logout = async (): Promise<boolean> => {
    try {
      const response = await api.post("/auth/logout");
      if (response.data.success) {
        setUser(null);
        toast.success("Logged out successfully");

        return true;
      }
      return false;
    } catch (err: any) {
      // Even if logout fails, clear local state
      setUser(null);

      const error = err as AxiosError<{ message?: string }>;
      const message = error.response?.data?.message || "Logout failed";
      toast.error(message);
      return false;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};
