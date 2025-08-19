'use client';

import { useEffect, useState } from 'react';
import { Video, Users, Clock, ArrowRight } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { roomAPI } from '@/lib/api';
import { Room } from '@/types';

export default function VideoCallsPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const userRooms = await roomAPI.getMyRooms();
      setRooms(userRooms);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeVideoCalls = rooms.filter(room => room.video?.active);
  const videoEnabledRooms = rooms.filter(room => room.video || true); // All rooms can have video

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Video Calls</h1>
            <p className="text-gray-600">Manage video conferencing in your rooms</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Powered by VideoSDK</p>
            <p className="text-xs text-green-600">✅ Active</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Video className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Calls</p>
                <p className="text-2xl font-bold text-gray-900">{activeVideoCalls.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Video Rooms</p>
                <p className="text-2xl font-bold text-gray-900">{videoEnabledRooms.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Video Calls */}
        {activeVideoCalls.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Active Video Calls</h2>
              <p className="text-sm text-gray-600">Join ongoing video conferences</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {activeVideoCalls.map((room) => (
                  <div key={room.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Video className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium text-gray-900">{room.name}</h3>
                        <p className="text-sm text-gray-500">{room.memberCount} members</p>
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/rooms/${room.id}/call`}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Join Call
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* All Rooms */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Your Rooms</h2>
                <p className="text-sm text-gray-600">Start video calls in any room</p>
              </div>
              <Link
                href="/dashboard/rooms"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
              >
                View all rooms
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading rooms...</p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-8">
                <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms yet</h3>
                <p className="text-gray-500 mb-6">Create your first room to start video calls</p>
                <Link
                  href="/dashboard/create-room"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  Create Room
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {rooms.map((room) => (
                  <div key={room.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        room.video?.active ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Video className={`h-5 w-5 ${
                          room.video?.active ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium text-gray-900">{room.name}</h3>
                        <p className="text-sm text-gray-500">
                          {room.memberCount} members • 
                          {room.video?.active ? (
                            <span className="text-green-600"> Video call active</span>
                          ) : (
                            <span> Video available</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        href={`/dashboard/rooms/${room.id}`}
                        className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                      >
                        View Room
                      </Link>
                      {room.video?.active ? (
                        <Link
                          href={`/dashboard/rooms/${room.id}/call`}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          Join Call
                        </Link>
                      ) : (
                        <Link
                          href={`/dashboard/rooms/${room.id}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Start Call
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
