'use client';

import { useEffect, useState } from 'react';
import { 
  Video, 
  Users, 
  Clock, 
  ArrowRight, 
  Play, 
  Phone, 
  Calendar,
  TrendingUp,
  Activity,
  Zap,
  Star,
  Eye,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Wifi,
  WifiOff,
  Mic,
  MicOff,
  Camera,
  CameraOff
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { roomAPI } from '@/lib/api';
import { Room } from '@/types';

export default function VideoCallsPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'available'>('all');

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
  const videoEnabledRooms = rooms.filter(room => room.video || true);

  // Filter rooms based on search and filter
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && room.video?.active) ||
      (filter === 'available' && !room.video?.active);
    
    return matchesSearch && matchesFilter;
  });

  const getRoomStatusColor = (room: Room) => {
    if (room.video?.active) return 'bg-emerald-500';
    return 'bg-blue-500';
  };

  const getRoomStatusText = (room: Room) => {
    if (room.video?.active) return 'Live';
    return 'Ready';
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl mb-8">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative px-8 py-12 text-white">
            <div className="flex items-center justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Video className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold">Video Calls</h1>
                    <p className="text-blue-100 text-lg">Professional video conferencing powered by VideoSDK</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-blue-100">
                  <div className="flex items-center space-x-2">
                    <Wifi className="h-4 w-4" />
                    <span className="text-sm">HD Quality</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">Unlimited Participants</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4" />
                    <span className="text-sm">Instant Join</span>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="text-right">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <Video className="h-8 w-8" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{activeVideoCalls.length}</p>
                        <p className="text-blue-100 text-sm">Active Calls</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 stats-grid">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Active Calls</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{activeVideoCalls.length}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Live now</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <Video className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Video Rooms</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{videoEnabledRooms.length}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Available</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Total Rooms</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{rooms.length}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Created</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Uptime</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">99.9%</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Reliable</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 search-filter-container">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                               <input
                   type="text"
                   placeholder="Search rooms..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 search-input"
                 />
            </div>
                         <div className="flex space-x-2 filter-buttons">
                             <button
                 onClick={() => setFilter('all')}
                 className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors filter-button ${
                   filter === 'all' 
                     ? 'bg-blue-600 text-white' 
                     : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                 }`}
               >
                All Rooms
              </button>
                             <button
                 onClick={() => setFilter('active')}
                 className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors filter-button ${
                   filter === 'active' 
                     ? 'bg-emerald-600 text-white' 
                     : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                 }`}
               >
                Active Calls
              </button>
                             <button
                 onClick={() => setFilter('available')}
                 className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors filter-button ${
                   filter === 'available' 
                     ? 'bg-blue-600 text-white' 
                     : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                 }`}
               >
                Available
              </button>
            </div>
          </div>
        </div>

        {/* Active Video Calls Section */}
        {activeVideoCalls.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <Video className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Live Video Calls</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Join ongoing video conferences</p>
                </div>
                <div className="ml-auto">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{activeVideoCalls.length} active</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeVideoCalls.map((room) => (
                                     <div key={room.id} className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-700/50 rounded-xl p-6 hover:shadow-md transition-all duration-300 active-call-card">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                          <Video className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{room.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{room.memberCount} participants</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">LIVE</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{room.memberCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>Started recently</span>
                        </div>
                      </div>
                                             <Link
                         href={`/dashboard/rooms/${room.id}/call`}
                         className="bg-emerald-600 dark:bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 dark:hover:bg-emerald-700 transition-colors font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl action-button"
                       >
                        <Phone className="h-4 w-4" />
                        <span>Join Call</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* All Rooms Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Rooms</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Start video calls in any room</p>
                </div>
              </div>
              <Link
                href="/dashboard/rooms"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center space-x-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-2 rounded-lg transition-colors"
              >
                <span>View all rooms</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading your rooms...</p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-12 empty-state">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Video className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No rooms yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">Create your first room to start video calls and collaborate with your team</p>
                <Link
                  href="/dashboard/create-room"
                  className="bg-blue-600 dark:bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors inline-flex items-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Room</span>
                </Link>
              </div>
            ) : (
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 video-grid">
                {filteredRooms.map((room) => (
                  <div key={room.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300 room-card">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          room.video?.active 
                            ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                            : 'bg-blue-100 dark:bg-blue-900/30'
                        }`}>
                          <Video className={`h-6 w-6 ${
                            room.video?.active 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : 'text-blue-600 dark:text-blue-400'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{room.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{room.memberCount} members</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${getRoomStatusColor(room)}`}></div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{getRoomStatusText(room)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Status</span>
                        <span className={`font-medium ${
                          room.video?.active 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-blue-600 dark:text-blue-400'
                        }`}>
                          {room.video?.active ? 'Live Call' : 'Ready for Call'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Last Activity</span>
                        <span className="text-gray-900 dark:text-white">Today</span>
                      </div>
                    </div>

                                         <div className="flex space-x-2 room-actions">
                      <Link
                        href={`/dashboard/rooms/${room.id}`}
                                                 className="flex-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-4 py-2 text-sm font-medium text-center border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors action-button"
                      >
                        <Eye className="h-4 w-4 inline mr-1" />
                        View
                      </Link>
                      {room.video?.active ? (
                        <Link
                          href={`/dashboard/rooms/${room.id}/call`}
                                                     className="flex-1 bg-emerald-600 dark:bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-700 transition-colors text-sm font-medium text-center shadow-md hover:shadow-lg action-button"
                        >
                          <Phone className="h-4 w-4 inline mr-1" />
                          Join
                        </Link>
                      ) : (
                        <Link
                          href={`/dashboard/rooms/${room.id}`}
                                                     className="flex-1 bg-blue-600 dark:bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors text-sm font-medium text-center shadow-md hover:shadow-lg action-button"
                        >
                          <Play className="h-4 w-4 inline mr-1" />
                          Start
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
