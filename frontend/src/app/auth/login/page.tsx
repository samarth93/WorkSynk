'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, LogIn, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginRequest } from '@/types';
import { workspaceAPI } from '@/lib/api';
// Import removed as isValidEmail is not used in login (validation happens on backend)

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<LoginRequest>({
    emailOrUsername: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Workspace invite verification state
  const [showInviteSection, setShowInviteSection] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'checking' | 'found' | 'not-found' | 'error'>('idle');
  const [inviteData, setInviteData] = useState<{ id: string; workspaceName?: string } | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.emailOrUsername.trim()) {
      newErrors.emailOrUsername = 'Email or username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await login(formData);
      // Redirect will happen automatically via useEffect
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setErrors({
        submit: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleInviteCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteEmail.trim()) {
      return;
    }

    setInviteStatus('checking');

    try {
      const response = await workspaceAPI.verifyInvite({ email: inviteEmail });
      setInviteData(response);
      setInviteStatus('found');
    } catch (error: unknown) {
      console.error('Invite verification error:', error);
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 
          'status' in error.response && error.response.status === 404) {
        setInviteStatus('not-found');
      } else {
        setInviteStatus('error');
      }
    }
  };

  const handleJoinWorkspace = () => {
    if (inviteData) {
      // Redirect to registration with invite data
      const params = new URLSearchParams({
        email: inviteEmail,
        inviteId: inviteData.id,
        workspaceName: inviteData.workspaceName || 'Workspace'
      });
      router.push(`/auth/register?${params.toString()}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <LogIn className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your workspace account
          </p>
        </div>

        {/* Workspace Invite Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center mb-4">
            <div className="mx-auto h-12 w-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Join Workspace</h3>
            <p className="text-sm text-gray-600">Check if you&apos;ve been invited to join a workspace</p>
          </div>

          {!showInviteSection ? (
            <button
              onClick={() => setShowInviteSection(true)}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              Check Workspace Invite
            </button>
          ) : (
            <div className="space-y-4">
              <form onSubmit={handleInviteCheck} className="space-y-3">
                <div>
                  <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="inviteEmail"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 bg-white placeholder-gray-500"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={inviteStatus === 'checking'}
                  className="w-full py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {inviteStatus === 'checking' ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Checking...
                    </div>
                  ) : (
                    'Check Invite'
                  )}
                </button>
              </form>

              {/* Invite Status Messages */}
              {inviteStatus === 'found' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Invite Found!
                      </p>
                      <p className="text-sm text-green-700">
                        You&apos;ve been invited to join &quot;{inviteData?.workspaceName || 'Workspace'}&quot;
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleJoinWorkspace}
                    className="mt-3 w-full py-2 px-4 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Join Workspace
                  </button>
                </div>
              )}

              {inviteStatus === 'not-found' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        No Invite Found
                      </p>
                      <p className="text-sm text-yellow-700">
                        No workspace invite found for this email address.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {inviteStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        Error
                      </p>
                      <p className="text-sm text-red-700">
                        Unable to check invite status. Please try again.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setShowInviteSection(false);
                  setInviteEmail('');
                  setInviteStatus('idle');
                  setInviteData(null);
                }}
                className="w-full py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Global Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.submit}
              </div>
            )}

            {/* Email/Username Field */}
            <div>
              <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-700 mb-2">
                Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="emailOrUsername"
                  name="emailOrUsername"
                  type="text"
                  required
                  value={formData.emailOrUsername}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 bg-white placeholder-gray-500 ${
                    errors.emailOrUsername ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email or username"
                />
              </div>
              {errors.emailOrUsername && (
                <p className="mt-1 text-sm text-red-600">{errors.emailOrUsername}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 bg-white placeholder-gray-500 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/register"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-4">Secure workspace features:</p>
          <div className="flex justify-center space-x-6 text-xs text-gray-400">
            <span>💬 Real-time Chat</span>
            <span>🏠 Team Rooms</span>
            <span>📹 Video Calls</span>
          </div>
          <p className="text-xs text-green-600 mt-2">✅ Available now</p>
        </div>
      </div>
    </div>
  );
}
