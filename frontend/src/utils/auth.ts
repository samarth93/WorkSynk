import { jwtDecode } from 'jwt-decode';
import { User, AuthResponse } from '@/types';

interface JWTPayload {
  sub: string; // user ID
  username: string;
  email: string;
  exp: number;
  iat: number;
}

/**
 * Save authentication data to localStorage
 */
export const saveAuthData = (authResponse: AuthResponse): void => {
  localStorage.setItem('token', authResponse.token);
  localStorage.setItem('user', JSON.stringify({
    id: authResponse.userId,
    username: authResponse.username,
    email: authResponse.email,
    firstName: authResponse.firstName,
    lastName: authResponse.lastName,
  }));
};

/**
 * Get authentication token from localStorage
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

/**
 * Get user data from localStorage
 */
export const getStoredUser = (): Partial<User> | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    return null;
  }
};

/**
 * Clear authentication data from localStorage
 */
export const clearAuthData = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;
  
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    // Check if token is not expired
    return decoded.exp * 1000 > Date.now();
  } catch (error) {
    console.error('Error decoding token:', error);
    return false;
  }
};

/**
 * Decode JWT token and extract user information
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwtDecode<JWTPayload>(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Get user ID from token
 */
export const getUserIdFromToken = (token?: string): string | null => {
  const authToken = token || getToken();
  if (!authToken) return null;
  
  const decoded = decodeToken(authToken);
  return decoded?.sub || null;
};

/**
 * Get username from token
 */
export const getUsernameFromToken = (token?: string): string | null => {
  const authToken = token || getToken();
  if (!authToken) return null;
  
  const decoded = decodeToken(authToken);
  return decoded?.username || null;
};

/**
 * Get email from token
 */
export const getEmailFromToken = (token?: string): string | null => {
  const authToken = token || getToken();
  if (!authToken) return null;
  
  const decoded = decodeToken(authToken);
  return decoded?.email || null;
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token?: string): boolean => {
  const authToken = token || getToken();
  if (!authToken) return true;
  
  try {
    const decoded = jwtDecode<JWTPayload>(authToken);
    return decoded.exp * 1000 <= Date.now();
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Get token expiration time
 */
export const getTokenExpiration = (token?: string): Date | null => {
  const authToken = token || getToken();
  if (!authToken) return null;
  
  const decoded = decodeToken(authToken);
  if (!decoded) return null;
  
  return new Date(decoded.exp * 1000);
};

/**
 * Auto-logout when token expires
 */
export const setupTokenExpirationCheck = (onExpire: () => void): void => {
  const token = getToken();
  if (!token) return;
  
  const expiration = getTokenExpiration(token);
  if (!expiration) return;
  
  const timeToExpiration = expiration.getTime() - Date.now();
  
  if (timeToExpiration <= 0) {
    // Token already expired
    onExpire();
    return;
  }
  
  // Set timeout to logout when token expires
  setTimeout(() => {
    onExpire();
  }, timeToExpiration);
};

/**
 * Refresh token check - returns true if token needs to be refreshed soon
 */
export const shouldRefreshToken = (minutesBeforeExpiry: number = 5): boolean => {
  const token = getToken();
  if (!token) return false;
  
  const expiration = getTokenExpiration(token);
  if (!expiration) return false;
  
  const timeToExpiration = expiration.getTime() - Date.now();
  const refreshThreshold = minutesBeforeExpiry * 60 * 1000; // Convert to milliseconds
  
  return timeToExpiration <= refreshThreshold;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate username format
 */
export const isValidUsername = (username: string): boolean => {
  // Username should be 3-20 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * Generate a random string for temporary IDs
 */
export const generateTempId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Format user display name
 */
export const formatUserDisplayName = (user: Partial<User>): string => {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user.firstName) {
    return user.firstName;
  }
  return user.username || 'Unknown User';
};

/**
 * Get user initials for avatar
 */
export const getUserInitials = (user: Partial<User>): string => {
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  if (user.firstName) {
    return user.firstName[0].toUpperCase();
  }
  if (user.username) {
    return user.username.substring(0, 2).toUpperCase();
  }
  return 'U';
};
