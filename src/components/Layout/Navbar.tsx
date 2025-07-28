'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Settings, Home, FileText, Upload } from 'lucide-react';
import ApiStatusIndicator from '../ApiStatusIndicator';

const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Auth App</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* API Status Indicator */}
            <ApiStatusIndicator />
            
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <Home className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/posts"
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <FileText className="w-4 h-4" />
                  <span>Posts</span>
                </Link>

                <Link
                  href="/files"
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <Upload className="w-4 h-4" />
                  <span>Files</span>
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-gray-500" />
                    <div className="text-sm">
                      <p className="text-gray-900 font-medium">{user.name || user.email}</p>
                      <p className="text-gray-500 text-xs">{user.role}</p>
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;