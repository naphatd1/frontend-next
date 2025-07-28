'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="p-2 w-9 h-9 rounded-lg bg-gray-100 animate-pulse">
        <div className="w-5 h-5 bg-gray-300 rounded"></div>
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative group p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5">
        {/* Sun Icon */}
        <Sun
          className={`absolute inset-0 w-5 h-5 text-yellow-500 transition-all duration-300 ${
            theme === 'light'
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 rotate-90 scale-75'
          }`}
        />
        
        {/* Moon Icon */}
        <Moon
          className={`absolute inset-0 w-5 h-5 text-blue-400 transition-all duration-300 ${
            theme === 'dark'
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 -rotate-90 scale-75'
          }`}
        />
      </div>
      
      {/* Tooltip */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 delay-300 pointer-events-none whitespace-nowrap shadow-lg border border-gray-700 dark:border-gray-300" style={{ zIndex: 10000 }}>
        {theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-100 border-l border-t border-gray-700 dark:border-gray-300 rotate-45"></div>
      </div>
    </button>
  );
};

export default ThemeToggle;