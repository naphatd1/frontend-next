'use client';

import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, Loader2, AlertTriangle } from 'lucide-react';

const ApiStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    checkApiHealth();
    // Check every 30 seconds
    const interval = setInterval(checkApiHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      setStatus('connected');
      setError('');
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Connection failed');
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'loading':
        return {
          icon: Loader2,
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30',
          borderColor: 'border-yellow-200 dark:border-yellow-700',
          text: 'Checking...',
          animate: 'animate-spin',
          pulse: ''
        };
      case 'connected':
        return {
          icon: Wifi,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30',
          borderColor: 'border-green-200 dark:border-green-700',
          text: 'Online',
          animate: '',
          pulse: 'animate-pulse'
        };
      case 'error':
        return {
          icon: WifiOff,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30',
          borderColor: 'border-red-200 dark:border-red-700',
          text: 'Offline',
          animate: '',
          pulse: 'animate-pulse'
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <div className="relative group">
      <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border ${config.bgColor} ${config.borderColor} transition-all duration-200 cursor-default`}>
        <div className="relative">
          <StatusIcon className={`w-3 h-3 ${config.color} ${config.animate}`} />
          {status === 'connected' && (
            <div className={`absolute inset-0 w-3 h-3 ${config.color} rounded-full ${config.pulse} opacity-75`}></div>
          )}
        </div>
        <span className={`text-xs font-medium ${config.color}`}>
          {config.text}
        </span>
      </div>

      {/* Tooltip */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 delay-300 pointer-events-none whitespace-nowrap shadow-xl border border-gray-700 dark:border-gray-300" style={{ zIndex: 10000 }}>
        {status === 'connected' && (
          <div>
            <div className="font-medium text-green-400 dark:text-green-600">● API Online</div>
            <div className="text-gray-300 dark:text-gray-600 text-xs">Last: {new Date().toLocaleTimeString()}</div>
          </div>
        )}
        {status === 'error' && (
          <div>
            <div className="font-medium text-red-400 dark:text-red-600">● API Offline</div>
            <div className="text-gray-300 dark:text-gray-600 text-xs">Error: {error}</div>
            <div className="text-gray-300 dark:text-gray-600 text-xs mt-1">Click to retry</div>
          </div>
        )}
        {status === 'loading' && (
          <div>
            <div className="font-medium text-yellow-400 dark:text-yellow-600">● Checking...</div>
          </div>
        )}
        
        {/* Tooltip arrow */}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-100 border-l border-t border-gray-700 dark:border-gray-300 rotate-45"></div>
      </div>

      {/* Click to retry when error */}
      {status === 'error' && (
        <button
          onClick={checkApiHealth}
          className="absolute inset-0 w-full h-full rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          aria-label="Retry API connection"
        />
      )}
    </div>
  );
};

export default ApiStatusIndicator;