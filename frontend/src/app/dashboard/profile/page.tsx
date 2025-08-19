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
  AlertCircle
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

  // Status options with labels and colors
  const statusOptions = [
    { value: 'online', label: 'Online', color: 'bg-green-500', description: 'Available and active' },
    { value: 'busy', label: 'Busy', color: 'bg-red-500', description: 'Do not disturb' },
    { value: 'away', label: 'Away', color: 'bg-yellow-500', description: 'Temporarily unavailable' },
    { value: 'offline', label: 'Offline', color: 'bg-gray-500', description: 'Not available' },
    { value: 'vacation', label: 'On Vacation', color: 'bg-blue-500', description: 'Taking time off' },
    { value: 'medical_leave', label: 'Medical Leave', color: 'bg-purple-500', description: 'On medical leave' },
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage your personal information and status</p>
        </div>

        {message && (
          <div className={`mb-6 px-4 py-3 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <Check className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              <span className="text-sm sm:text-base">{message.text}</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Profile Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Profile Picture */}
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                    {user.profilePictureUrl ? (
                      <img
                        src={user.profilePictureUrl}
                        alt={formatUserDisplayName(user)}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
                      />
                    ) : (
                      getUserInitials(user)
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                    <Camera className="h-3 w-3" />
                  </button>
                </div>

                {/* User Info */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {formatUserDisplayName(user)}
                  </h2>
                  <div className="flex items-center mt-1">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 text-sm sm:text-base">{user.email}</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 text-sm sm:text-base">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm font-medium"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Status Section */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Current Status</h3>
              {!isEditing && (
                <div className="flex items-center space-x-2">
                  <Circle className={`h-3 w-3 ${getCurrentStatus().color}`} />
                  <span className="text-sm font-medium text-gray-900">
                    {getCurrentStatus().label}
                  </span>
                </div>
              )}
            </div>
            
            {isEditing ? (
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white text-sm sm:text-base"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-gray-600 text-sm sm:text-base">{getCurrentStatus().description}</p>
            )}
          </div>

          {/* Profile Information Form */}
          <div className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
            
            <div className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 bg-white placeholder-gray-500 text-sm sm:text-base ${
                        isEditing 
                          ? (errors.firstName ? 'border-red-300' : 'border-gray-300')
                          : 'border-gray-200 bg-gray-50'
                      }`}
                      placeholder="Enter your first name"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 bg-white placeholder-gray-500 text-sm sm:text-base ${
                        isEditing 
                          ? (errors.lastName ? 'border-red-300' : 'border-gray-300')
                          : 'border-gray-200 bg-gray-50'
                      }`}
                      placeholder="Enter your last name"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Professional Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-2">
                    Designation
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="designation"
                      name="designation"
                      type="text"
                      value={formData.designation}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 bg-white placeholder-gray-500 text-sm sm:text-base ${
                        isEditing 
                          ? (errors.designation ? 'border-red-300' : 'border-gray-300')
                          : 'border-gray-200 bg-gray-50'
                      }`}
                      placeholder="e.g. Senior Developer"
                    />
                  </div>
                  {errors.designation && (
                    <p className="mt-1 text-sm text-red-600">{errors.designation}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="role"
                      name="role"
                      type="text"
                      value={formData.role}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 bg-white placeholder-gray-500 text-sm sm:text-base ${
                        isEditing 
                          ? (errors.role ? 'border-red-300' : 'border-gray-300')
                          : 'border-gray-200 bg-gray-50'
                      }`}
                      placeholder="e.g. Frontend Lead"
                    />
                  </div>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none text-gray-900 bg-white placeholder-gray-500 text-sm sm:text-base ${
                      isEditing 
                        ? (errors.bio ? 'border-red-300' : 'border-gray-300')
                        : 'border-gray-200 bg-gray-50'
                    }`}
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  {errors.bio && (
                    <p className="text-sm text-red-600">{errors.bio}</p>
                  )}
                  <p className="text-sm text-gray-500 ml-auto">
                    {formData.bio.length}/500 characters
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
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
    </DashboardLayout>
  );
}
