'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthState, User, LoginRequest, RegisterRequest, AuthResponse } from '@/types';
import { authAPI, userAPI } from '@/lib/api';
import { 
  saveAuthData, 
  clearAuthData, 
  isAuthenticated, 
  getStoredUser,
  setupTokenExpirationCheck 
} from '@/utils/auth';

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: undefined,
    token: undefined,
    isAuthenticated: false,
    isLoading: true,
  });
  const [isMounted, setIsMounted] = useState(false);

  // Mark as mounted to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fallback to prevent infinite loading
  useEffect(() => {
    if (!isMounted) return; // Don't run until mounted
    
    const fallbackTimer = setTimeout(() => {
      if (authState.isLoading) {
        console.log('Auth loading timeout, setting to not authenticated');
        setAuthState({
          user: undefined,
          token: undefined,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    }, 5000); // 5 second fallback

    return () => clearTimeout(fallbackTimer);
  }, [authState.isLoading, isMounted]);

  // Initialize authentication state
  useEffect(() => {
    if (!isMounted) return; // Don't run until mounted
    
    const initializeAuth = async () => {
      try {
        if (isAuthenticated()) {
          const storedUser = getStoredUser();
          
          if (storedUser) {
            // Try to fetch fresh user data with timeout
            try {
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 3000)
              );
              const currentUserPromise = userAPI.getCurrentUser();
              
              const currentUser = await Promise.race([currentUserPromise, timeoutPromise]);
              
              setAuthState({
                user: currentUser as User,
                token: localStorage.getItem('token') || undefined,
                isAuthenticated: true,
                isLoading: false,
              });
            } catch (fetchError) {
              // If fetch fails, use stored user data
              console.log('Failed to fetch fresh user data, using stored data:', fetchError);
              setAuthState({
                user: storedUser as User,
                token: localStorage.getItem('token') || undefined,
                isAuthenticated: true,
                isLoading: false,
              });
            }
          } else {
            // No stored user data, clear everything
            clearAuthData();
            setAuthState({
              user: undefined,
              token: undefined,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } else {
          // Not authenticated
          clearAuthData();
          setAuthState({
            user: undefined,
            token: undefined,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuthData();
        setAuthState({
          user: undefined,
          token: undefined,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    // Add a small delay to ensure everything is ready
    const timer = setTimeout(initializeAuth, 100);
    return () => clearTimeout(timer);
  }, [isMounted]);

  // Setup token expiration check
  useEffect(() => {
    if (authState.isAuthenticated && authState.token) {
      setupTokenExpirationCheck(() => {
        console.log('Token expired, logging out...');
        logout();
      });
    }
  }, [authState.isAuthenticated, authState.token]);

  const login = async (data: LoginRequest): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const authResponse: AuthResponse = await authAPI.login(data);
      
      // Save auth data to localStorage
      saveAuthData(authResponse);
      
      // Fetch complete user profile
      const userProfile = await userAPI.getCurrentUser();
      
      setAuthState({
        user: userProfile,
        token: authResponse.token,
        isAuthenticated: true,
        isLoading: false,
      });
      
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const register = async (data: RegisterRequest): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const authResponse: AuthResponse = await authAPI.register(data);
      
      // Save auth data to localStorage
      saveAuthData(authResponse);
      
      // Fetch complete user profile
      const userProfile = await userAPI.getCurrentUser();
      
      setAuthState({
        user: userProfile,
        token: authResponse.token,
        isAuthenticated: true,
        isLoading: false,
      });
      
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = (): void => {
    try {
      // Call logout API (optional, since JWT is stateless)
      authAPI.logout().catch(console.error);
    } catch (error) {
      console.error('Logout API error:', error);
    }
    
    // Clear local data
    clearAuthData();
    
    // Update state
    setAuthState({
      user: undefined,
      token: undefined,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const updateUser = (userData: Partial<User>): void => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...userData };
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const refreshUser = async (): Promise<void> => {
    if (!authState.isAuthenticated) return;
    
    try {
      const userProfile = await userAPI.getCurrentUser();
      setAuthState(prev => ({
        ...prev,
        user: userProfile,
      }));
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(userProfile));
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // If refresh fails, might be due to invalid token
      if (error instanceof Error && error.message.includes('401')) {
        logout();
      }
    }
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
