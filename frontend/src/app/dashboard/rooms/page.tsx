'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import './rooms.css';
import { 
  Plus, 
  MessageSquare, 
  Users, 
  Video, 
  Clock, 
  Star, 
  MoreHorizontal,
  Search,
  Filter,
  Sparkles,
  TrendingUp,
  Activity
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { roomAPI } from '@/lib/api';
import { Room } from '@/types';

export default function MyRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'recent'>('all');

  useEffect(() => {
    const loadRooms = async () => {
      try {
        setIsLoading(true);
        const myRooms = await roomAPI.getMyRooms();
        setRooms(myRooms);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load rooms');
      } finally {
        setIsLoading(false);
      }
    };
    loadRooms();
  }, []);

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (room.description && room.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterType === 'active') {
      return matchesSearch && room.active;
    } else if (filterType === 'recent') {
      return matchesSearch && room.lastMessageAt;
    }
    return matchesSearch;
  });

  const getRoomStatus = (room: Room) => {
    if (room.video?.active) return 'live';
    if (room.lastMessageAt) {
      const lastMessageTime = new Date(room.lastMessageAt);
      const now = new Date();
      const diffHours = (now.getTime() - lastMessageTime.getTime()) / (1000 * 60 * 60);
      if (diffHours < 1) return 'active';
      if (diffHours < 24) return 'recent';
    }
    return 'quiet';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500';
      case 'active': return 'bg-green-500';
      case 'recent': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live': return 'Live Call';
      case 'active': return 'Active';
      case 'recent': return 'Recent';
      default: return 'Quiet';
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl mb-8">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative px-8 py-12 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Your Workspace Rooms</h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              Connect, collaborate, and create in your personalized workspace rooms
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
                             <Link
                 href="/dashboard/create-room"
                 className="group btn-hover-effect inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-2xl hover:bg-blue-50 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
               >
                <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Create New Room
              </Link>
              <div className="flex items-center gap-2 text-white/80">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm">{rooms.length} rooms available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
              />
            </div>
            
            {/* Filter Buttons */}
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All Rooms', icon: MessageSquare },
                { key: 'active', label: 'Active', icon: Activity },
                { key: 'recent', label: 'Recent', icon: Clock }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setFilterType(key as any)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-medium transition-all duration-300 ${
                    filterType === key
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Rooms</p>
                <p className="text-3xl font-bold text-gray-900">{rooms.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Rooms</p>
                <p className="text-3xl font-bold text-gray-900">
                  {rooms.filter(r => getRoomStatus(r) === 'active' || getRoomStatus(r) === 'live').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Live Calls</p>
                <p className="text-3xl font-bold text-gray-900">
                  {rooms.filter(r => r.video?.active).length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <Video className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Rooms Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-6"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-8"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Error</span>
            </div>
            {error}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mx-auto flex items-center justify-center">
                <MessageSquare className="h-12 w-12 text-blue-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No rooms found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm ? 'Try adjusting your search terms or filters.' : 'Start by creating your first workspace room to collaborate with your team.'}
            </p>
            <Link
              href="/dashboard/create-room"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create your first room
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => {
              const status = getRoomStatus(room);
              return (
                                 <Link
                   key={room.id}
                   href={`/dashboard/rooms/${room.id}`}
                   className="group room-card block bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                 >
                  {/* Room Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {room.name}
                        </h3>
                        {room.description && (
                          <p className="text-gray-600 mt-2 line-clamp-2 text-sm leading-relaxed">
                            {room.description}
                          </p>
                        )}
                      </div>
                                             <div className="flex items-center gap-2 ml-4">
                         <div className={`w-3 h-3 rounded-full ${getStatusColor(status)} status-pulse`}></div>
                         <span className="text-xs font-medium text-gray-500 status-badge">{getStatusText(status)}</span>
                       </div>
                    </div>
                  </div>

                  {/* Room Footer */}
                  <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Users className="h-4 w-4" />
                          <span className="text-sm font-medium">{room.members?.length ?? 0}</span>
                        </div>
                        {room.videoCallEnabled && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Video className="h-4 w-4" />
                            <span className="text-sm">Video</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {room.lastMessageAt && (
                          <div className="flex items-center gap-1 text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs">
                              {new Date(room.lastMessageAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        <div className="p-1 rounded-full bg-gray-200 group-hover:bg-blue-200 transition-colors">
                          <MoreHorizontal className="h-3 w-3 text-gray-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/5 transition-all duration-300 pointer-events-none"></div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Quick Actions Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
            <TrendingUp className="h-4 w-4" />
            <span>Need help? Check out our room management guide</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


