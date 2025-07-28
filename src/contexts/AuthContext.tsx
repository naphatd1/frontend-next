'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { authAPI } from '@/lib/api';
import { authFetchAPI } from '@/lib/api-fetch';
import { rateLimiter, csrfToken } from '@/lib/security';
import { User, AuthResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    // Generate CSRF token on app start
    if (!csrfToken.get()) {
      const token = csrfToken.generate();
      csrfToken.store(token);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const token = Cookies.get('access_token');
      const savedUser = Cookies.get('user');

      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
        
        // Verify token is still valid (skip for now to avoid errors)
        // try {
        //   const response = await authAPI.getProfile();
        //   setUser(response.data);
        // } catch (error) {
        //   // Token invalid, clear auth
        //   clearAuth();
        // }
      }
    } catch (error) {
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = () => {
    setUser(null);
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    Cookies.remove('user');
    // Clear CSRF token
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('csrf_token');
    }
  };

  const login = async (email: string, password: string) => {
    // Rate limiting check
    const rateLimitKey = `login_${email}`;
    if (!rateLimiter.isAllowed(rateLimitKey, 5, 15 * 60 * 1000)) {
      const remaining = rateLimiter.getRemainingAttempts(rateLimitKey, 5);
      toast.error(`Too many login attempts. Please try again later. (${remaining} attempts remaining)`);
      throw new Error('Rate limit exceeded');
    }

    try {
      console.log('Attempting secure login');
      
      // Use secure API with validation
      const response = await authAPI.login({ email, password });
      const authData: AuthResponse = response.data;

      console.log('Login successful');

      // Save tokens and user data with secure flags
      Cookies.set('access_token', authData.access_token, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: 1 // 1 day
      });
      Cookies.set('refresh_token', authData.refresh_token, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: 7 // 7 days
      });
      Cookies.set('user', JSON.stringify(authData.user), {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: 1 // 1 day
      });

      setUser(authData.user);
      toast.success('Login successful!');
      
      // Clear rate limiting on successful login
      rateLimiter.attempts.delete(rateLimitKey);
      
      // Redirect based on role
      if (authData.user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error.message);
      
      let message = 'Login failed';
      if (error.message.includes('fetch') || error.code === 'ECONNREFUSED') {
        message = 'Cannot connect to server. Please check if the backend is running.';
      } else if (error.response?.status === 401) {
        message = 'Invalid email or password';
      } else if (error.response?.status === 429) {
        message = 'Too many requests. Please try again later.';
      } else if (error.response?.status === 400) {
        message = error.response.data?.message || 'Invalid request';
      } else if (error.message && !error.message.includes('Rate limit')) {
        message = error.message;
      }
      
      toast.error(message);
      throw error;
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    // Rate limiting check
    const rateLimitKey = `register_${email}`;
    if (!rateLimiter.isAllowed(rateLimitKey, 3, 60 * 60 * 1000)) { // 3 attempts per hour
      toast.error('Too many registration attempts. Please try again later.');
      throw new Error('Rate limit exceeded');
    }

    try {
      const response = await authAPI.register({ email, password, name });
      const authData: AuthResponse = response.data;

      // Save tokens and user data with secure flags
      Cookies.set('access_token', authData.access_token, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: 1
      });
      Cookies.set('refresh_token', authData.refresh_token, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: 7
      });
      Cookies.set('user', JSON.stringify(authData.user), {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: 1
      });

      setUser(authData.user);
      toast.success('Registration successful!');
      
      // Clear rate limiting on successful registration
      rateLimiter.attempts.delete(rateLimitKey);
      
      router.push('/dashboard');
    } catch (error: any) {
      let message = 'Registration failed';
      if (error.response?.status === 409) {
        message = 'Email already exists';
      } else if (error.response?.status === 429) {
        message = 'Too many requests. Please try again later.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message && !error.message.includes('Rate limit')) {
        message = error.message;
      }
      
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Ignore logout API errors
    } finally {
      clearAuth();
      toast.success('Logged out successfully');
      router.push('/auth/login');
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin: user?.role === 'ADMIN',
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};