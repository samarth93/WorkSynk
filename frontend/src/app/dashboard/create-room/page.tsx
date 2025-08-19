'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Users, Lock, Globe, Video } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { roomAPI } from '@/lib/api';
import { CreateRoomRequest } from '@/types';

export default function CreateRoomPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateRoomRequest>({
    name: '',
    description: '',
    isPrivate: false,
    maxMembers: 100,
    videoCallEnabled: true,
    maxVideoParticipants: 10,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Room name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Room name must be at least 3 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Room name cannot exceed 50 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    if (!formData.maxMembers || formData.maxMembers < 2) {
      newErrors.maxMembers = 'Maximum members must be at least 2';
    } else if (formData.maxMembers > 1000) {
      newErrors.maxMembers = 'Maximum members cannot exceed 1000';
    }

    if (!formData.maxVideoParticipants || formData.maxVideoParticipants < 2) {
      newErrors.maxVideoParticipants = 'Maximum video participants must be at least 2';
    } else if (formData.maxVideoParticipants > 50) {
      newErrors.maxVideoParticipants = 'Maximum video participants cannot exceed 50';
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
      const room = await roomAPI.createRoom(formData);
      router.push(`/dashboard/rooms/${room.id}`);
    } catch (error: unknown) {
      console.error('Room creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create room. Please try again.';
      setErrors({
        submit: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value),
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create New Room</h1>
              <p className="text-gray-600 text-sm sm:text-base">Set up a new workspace for your team</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Global Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm sm:text-base">
                {errors.submit}
              </div>
            )}

            {/* Room Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Room Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                className={`block w-full px-3 sm:px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 bg-white placeholder-gray-500 text-sm sm:text-base ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter room name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className={`block w-full px-3 sm:px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none text-gray-900 bg-white placeholder-gray-500 text-sm sm:text-base ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe what this room is for..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.description?.length || 0}/500 characters
              </p>
            </div>

            {/* Privacy Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Privacy Settings
              </label>
              <div className="space-y-3">
                <div className="flex items-start">
                  <input
                    id="public"
                    name="isPrivate"
                    type="radio"
                    checked={!formData.isPrivate}
                    onChange={() => setFormData(prev => ({ ...prev, isPrivate: false }))}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 mt-0.5"
                  />
                  <label htmlFor="public" className="ml-3 flex items-start">
                    <Globe className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Public Room</div>
                      <div className="text-sm text-gray-500">Anyone can find and join this room</div>
                    </div>
                  </label>
                </div>
                
                <div className="flex items-start">
                  <input
                    id="private"
                    name="isPrivate"
                    type="radio"
                    checked={formData.isPrivate}
                    onChange={() => setFormData(prev => ({ ...prev, isPrivate: true }))}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 mt-0.5"
                  />
                  <label htmlFor="private" className="ml-3 flex items-start">
                    <Lock className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Private Room</div>
                      <div className="text-sm text-gray-500">Only invited members can join</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Member Limits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Members
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="maxMembers"
                    name="maxMembers"
                    type="number"
                    min="2"
                    max="1000"
                    value={formData.maxMembers}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 bg-white placeholder-gray-500 text-sm sm:text-base ${
                      errors.maxMembers ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.maxMembers && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxMembers}</p>
                )}
              </div>

              <div>
                <label htmlFor="maxVideoParticipants" className="block text-sm font-medium text-gray-700 mb-2">
                  Max Video Participants
                </label>
                <div className="relative">
                  <Video className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="maxVideoParticipants"
                    name="maxVideoParticipants"
                    type="number"
                    min="2"
                    max="50"
                    value={formData.maxVideoParticipants}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 bg-white placeholder-gray-500 text-sm sm:text-base ${
                      errors.maxVideoParticipants ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.maxVideoParticipants && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxVideoParticipants}</p>
                )}
                <p className="mt-1 text-xs text-green-600">Video calls enabled for this room</p>
              </div>
            </div>

            {/* Video Call Settings */}
            <div>
              <div className="flex items-start">
                <input
                  id="videoCallEnabled"
                  name="videoCallEnabled"
                  type="checkbox"
                  checked={formData.videoCallEnabled}
                  onChange={handleInputChange}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded mt-0.5"
                />
                <label htmlFor="videoCallEnabled" className="ml-3 flex items-start">
                  <Video className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Enable Video Calls</div>
                    <div className="text-sm text-gray-500">Allow video conferencing in this room</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Room'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
