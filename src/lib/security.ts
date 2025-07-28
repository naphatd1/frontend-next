import DOMPurify from 'isomorphic-dompurify';

// Input sanitization utilities
export const sanitizeInput = {
  // Sanitize HTML content
  html: (input: string): string => {
    if (typeof window === 'undefined') {
      // Server-side: basic HTML escaping
      return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }
    // Client-side: use DOMPurify
    return DOMPurify.sanitize(input);
  },

  // Sanitize email input
  email: (email: string): string => {
    return email
      .trim()
      .toLowerCase()
      .replace(/[^\w@.-]/g, ''); // Only allow word chars, @, ., -
  },

  // Sanitize text input (remove potential SQL injection patterns)
  text: (input: string): string => {
    return input
      .trim()
      .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
      .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi, ''); // Remove SQL keywords
  },

  // Sanitize search queries
  search: (query: string): string => {
    return query
      .trim()
      .replace(/[<>'"%;()&+]/g, '') // Remove dangerous characters
      .substring(0, 100); // Limit length
  }
};

// Input validation utilities
export const validateInput = {
  // Email validation with additional security checks
  email: (email: string): { isValid: boolean; error?: string } => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!email || email.length === 0) {
      return { isValid: false, error: 'Email is required' };
    }
    
    if (email.length > 254) {
      return { isValid: false, error: 'Email is too long' };
    }
    
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Invalid email format' };
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /<script/i,
      /on\w+=/i
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(email)) {
        return { isValid: false, error: 'Invalid email format' };
      }
    }
    
    return { isValid: true };
  },

  // Password validation
  password: (password: string): { isValid: boolean; error?: string } => {
    if (!password || password.length === 0) {
      return { isValid: false, error: 'Password is required' };
    }
    
    if (password.length < 6) {
      return { isValid: false, error: 'Password must be at least 6 characters' };
    }
    
    if (password.length > 128) {
      return { isValid: false, error: 'Password is too long' };
    }
    
    return { isValid: true };
  },

  // General text validation
  text: (text: string, maxLength: number = 1000): { isValid: boolean; error?: string } => {
    if (text.length > maxLength) {
      return { isValid: false, error: `Text is too long (max ${maxLength} characters)` };
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /data:/i,
      /vbscript:/i
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(text)) {
        return { isValid: false, error: 'Invalid content detected' };
      }
    }
    
    return { isValid: true };
  }
};

// Rate limiting utilities (client-side)
export const rateLimiter = {
  attempts: new Map<string, { count: number; lastAttempt: number }>(),
  
  // Check if action is allowed
  isAllowed: (key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean => {
    const now = Date.now();
    const record = rateLimiter.attempts.get(key);
    
    if (!record) {
      rateLimiter.attempts.set(key, { count: 1, lastAttempt: now });
      return true;
    }
    
    // Reset if window has passed
    if (now - record.lastAttempt > windowMs) {
      rateLimiter.attempts.set(key, { count: 1, lastAttempt: now });
      return true;
    }
    
    // Check if limit exceeded
    if (record.count >= maxAttempts) {
      return false;
    }
    
    // Increment count
    record.count++;
    record.lastAttempt = now;
    return true;
  },
  
  // Get remaining attempts
  getRemainingAttempts: (key: string, maxAttempts: number = 5): number => {
    const record = rateLimiter.attempts.get(key);
    if (!record) return maxAttempts;
    return Math.max(0, maxAttempts - record.count);
  }
};

// Security headers for API requests
export const securityHeaders = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// CSRF token utilities
export const csrfToken = {
  generate: (): string => {
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      // Fallback for server-side
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },
  
  store: (token: string): void => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('csrf_token', token);
    }
  },
  
  get: (): string | null => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('csrf_token');
    }
    return null;
  }
};