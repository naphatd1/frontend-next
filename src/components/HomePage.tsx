'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, FileText, Upload, Users, Activity } from 'lucide-react';

const HomePage: React.FC = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();

  const features = [
    {
      name: 'Secure Authentication',
      description: 'JWT-based authentication with refresh tokens and role-based access control.',
      icon: Shield,
    },
    {
      name: 'Content Management',
      description: 'Create, edit, and manage your posts with a rich text editor and preview.',
      icon: FileText,
    },
    {
      name: 'File Upload',
      description: 'Upload images, documents, and large files with chunk upload support.',
      icon: Upload,
    },
    {
      name: 'User Management',
      description: 'Admin dashboard for managing users, roles, and system settings.',
      icon: Users,
    },
  ];

  if (isAuthenticated) {
    return (
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl transition-colors duration-200">
            Welcome back, {user?.name || user?.email}!
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 transition-colors duration-200">
            You're logged in as {user?.role}. What would you like to do today?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/dashboard"
            className="relative group bg-white dark:bg-gray-800 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg shadow hover:shadow-md dark:shadow-gray-900/20 transition-all duration-200"
          >
            <div>
              <span className="rounded-lg inline-flex p-3 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors duration-200">
                <Activity className="h-6 w-6" />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-200">
                Dashboard
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                View your overview and recent activity
              </p>
            </div>
          </Link>

          <Link
            href="/posts"
            className="relative group bg-white dark:bg-gray-800 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg shadow hover:shadow-md dark:shadow-gray-900/20 transition-all duration-200"
          >
            <div>
              <span className="rounded-lg inline-flex p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-colors duration-200">
                <FileText className="h-6 w-6" />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-200">
                My Posts
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                Create and manage your posts
              </p>
            </div>
          </Link>

          <Link
            href="/files"
            className="relative group bg-white dark:bg-gray-800 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg shadow hover:shadow-md dark:shadow-gray-900/20 transition-all duration-200"
          >
            <div>
              <span className="rounded-lg inline-flex p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors duration-200">
                <Upload className="h-6 w-6" />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-200">
                File Manager
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                Upload and manage your files
              </p>
            </div>
          </Link>

          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className="relative group bg-white dark:bg-gray-800 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg shadow hover:shadow-md dark:shadow-gray-900/20 transition-all duration-200"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 transition-colors duration-200">
                  <Users className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-200">
                  Admin Dashboard
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                  Manage users and system settings
                </p>
              </div>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl md:text-6xl transition-colors duration-200">
          <span className="block">Full-Stack</span>
          <span className="block text-primary-600 dark:text-primary-400">Authentication App</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300 transition-colors duration-200">
          A complete authentication system built with NestJS and Next.js, featuring JWT tokens, 
          role-based access control, file uploads, and admin dashboard.
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            href="/auth/register"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 transition-colors duration-200"
          >
            Get Started
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 transition-colors duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
              Everything you need
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 transition-colors duration-200">
              Built with modern technologies and best practices
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 dark:bg-primary-600 text-white mx-auto transition-colors duration-200">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-200">
                    {feature.name}
                  </h3>
                  <p className="mt-2 text-base text-gray-600 dark:text-gray-300 transition-colors duration-200">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Accounts */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 transition-colors duration-200">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-200">
            Demo Accounts
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-200">
            Try the app with these pre-configured accounts
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-md shadow-sm transition-colors duration-200">
              <h4 className="font-medium text-gray-900 dark:text-white transition-colors duration-200">Admin Account</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-200">admin@example.com</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-200">Password: admin123</p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-md shadow-sm transition-colors duration-200">
              <h4 className="font-medium text-gray-900 dark:text-white transition-colors duration-200">User Account</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-200">user@example.com</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-200">Password: user123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;