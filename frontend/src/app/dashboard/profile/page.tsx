'use client';

import { useEffect, useState } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Briefcase, 
  FileText,
  Circle,
  Camera,
  Save,
  Loader2,
  Check,
  AlertCircle,
  Edit3,
  Shield,
  Clock,
  MapPin,
  Phone,
  Globe,
  Linkedin,
  Github,
  Twitter
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI } from '@/lib/api';
import { formatUserDisplayName, getUserInitials } from '@/utils/auth';

type UserStatus = 'online' | 'offline' | 'vacation' | 'medical_leave' | 'busy' | 'away';

interface UserFormData {
  firstName: string;
  lastName: string;
  designation: string;
  role: string;
  bio: string;
  status: UserStatus;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    designation: '',
    role: '',
    bio: '',
    status: 'online'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [errors, setErrors] = useState<Partial<UserFormData>>({});

  // Status options with labels, colors, and icons
  const statusOptions = [
    { 
      value: 'online', 
      label: 'Online', 
      color: 'bg-emerald-500', 
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700',
      description: 'Available and active',
      icon: Circle
    },
    { 
      value: 'busy', 
      label: 'Busy', 
      color: 'bg-red-500', 
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      description: 'Do not disturb',
      icon: Circle
    },
    { 
      value: 'away', 
      label: 'Away', 
      color: 'bg-amber-500', 
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700',
      description: 'Temporarily unavailable',
      icon: Circle
    },
    { 
      value: 'offline', 
      label: 'Offline', 
      color: 'bg-gray-500', 
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-700',
      description: 'Not available',
      icon: Circle
    },
    { 
      value: 'vacation', 
      label: 'On Vacation', 
      color: 'bg-blue-500', 
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      description: 'Taking time off',
      icon: Circle
    },
    { 
      value: 'medical_leave', 
      label: 'Medical Leave', 
      color: 'bg-purple-500', 
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      description: 'On medical leave',
      icon: Circle
    },
  ] as const;

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        designation: user.designation || '',
        role: user.role || '',
        bio: user.bio || '',
        status: (user.status as UserStatus) || 'online'
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Partial<UserFormData> = {};

    if (formData.firstName.length > 50) {
      newErrors.firstName = 'First name must be less than 50 characters';
    }

    if (formData.lastName.length > 50) {
      newErrors.lastName = 'Last name must be less than 50 characters';
    }

    if (formData.designation.length > 100) {
      newErrors.designation = 'Designation must be less than 100 characters';
    }

    if (formData.role.length > 100) {
      newErrors.role = 'Role must be less than 100 characters';
    }

    if (formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof UserFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const updatedUser = await userAPI.updateProfile(formData);
      updateUser(updatedUser);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (err: unknown) {
      console.error('Failed to update profile:', err);
      setMessage({ 
        type: 'error', 
        text: err instanceof Error ? err.message : 'Failed to update profile.' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        designation: user.designation || '',
        role: user.role || '',
        bio: user.bio || '',
        status: (user.status as UserStatus) || 'online'
      });
    }
    setIsEditing(false);
    setErrors({});
    setMessage(null);
  };

  const getCurrentStatus = () => {
    return statusOptions.find(option => option.value === formData.status) || statusOptions[0];
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between profile-header">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Manage your personal information and preferences</p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 shadow-lg hover:shadow-xl gradient-button profile-actions"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border-l-4 ${
            message.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 text-emerald-800 dark:text-emerald-300 success-message' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-800 dark:text-red-300 error-message'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <Check className="h-5 w-5 mr-3 text-emerald-500" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-3 text-red-500" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 profile-grid">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden profile-card">
              {/* Profile Header */}
              <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 text-white">
                <div className="flex items-center space-x-4">
                  <div className="relative profile-picture-container">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-bold backdrop-blur-sm border-2 border-white/30">
                      {user.profilePictureUrl ? (
                        <img
                          src={user.profilePictureUrl}
                          alt={formatUserDisplayName(user)}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        getUserInitials(user)
                      )}
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center text-blue-600 hover:bg-gray-50 transition-colors shadow-lg camera-button">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold">{formatUserDisplayName(user)}</h2>
                    <p className="text-blue-100 text-sm">{formData.designation || 'No designation set'}</p>
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                  <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                  <Shield className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm capitalize">{user.role || 'User'}</span>
                </div>
              </div>

              {/* Status Section */}
              <div className="px-6 pb-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Current Status</h3>
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getCurrentStatus().color} animate-pulse`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{getCurrentStatus().label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{getCurrentStatus().description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 stats-card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Workspace</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Member Since</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Last Active</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Today</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden profile-card">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Information</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Update your personal and professional details</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Status Selection */}
                {isEditing && (
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                    <label htmlFor="status" className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Update Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700 text-sm transition-all duration-200"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label} - {option.description}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 form-section">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`block w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm ${
                          isEditing 
                            ? (errors.firstName 
                                ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500')
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                        }`}
                        placeholder="Enter your first name"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`block w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm ${
                          isEditing 
                            ? (errors.lastName 
                                ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500')
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                        }`}
                        placeholder="Enter your last name"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Professional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 form-section">
                  <div>
                    <label htmlFor="designation" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Designation
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <input
                        id="designation"
                        name="designation"
                        type="text"
                        value={formData.designation}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`block w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm ${
                          isEditing 
                            ? (errors.designation 
                                ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500')
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                        }`}
                        placeholder="e.g. Senior Developer"
                      />
                    </div>
                    {errors.designation && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.designation}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Role
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <input
                        id="role"
                        name="role"
                        type="text"
                        value={formData.role}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`block w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm ${
                          isEditing 
                            ? (errors.role 
                                ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500')
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                        }`}
                        placeholder="e.g. Frontend Lead"
                      />
                    </div>
                    {errors.role && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.role}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="form-section">
                  <label htmlFor="bio" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Bio
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`block w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm ${
                        isEditing 
                          ? (errors.bio 
                              ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500')
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                      }`}
                      placeholder="Tell us about yourself, your expertise, and what you're passionate about..."
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    {errors.bio && (
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.bio}
                      </p>
                    )}
                                         <p className={`text-sm ml-auto char-counter text-gray-500 dark:text-gray-400 ${
                       formData.bio.length > 450 ? 'text-yellow-600 dark:text-yellow-400 warning' : formData.bio.length > 480 ? 'text-red-600 dark:text-red-400 danger' : ''
                     }`}>
                       {formData.bio.length}/500 characters
                     </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-lg hover:shadow-xl"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin inline" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2 inline" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
