'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
  Activity,
  Grid3X3,
  List,
  SortAsc,
  Calendar,
  Shield,
  Zap,
  ArrowRight,
  Heart,
  Eye,
  Settings,
  Bookmark
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { roomAPI } from '@/lib/api';
import { Room } from '@/types';

export default function MyRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'recent' | 'favorites'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'activity' | 'members' | 'created'>('activity');

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
    } else if (filterType === 'favorites') {
      // For now, treat recently active rooms as favorites
      return matchesSearch && room.lastMessageAt && getRoomStatus(room) === 'active';
    }
    return matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'members':
        return (b.members?.length || 0) - (a.members?.length || 0);
      case 'created':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case 'activity':
      default:
        const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return bTime - aTime;
    }
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
      <div className="min-h-screen">
        {/* Enhanced Hero Section */}
        <div className="relative overflow-hidden rounded-3xl mb-8 p-8 sm:p-12 text-white bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 shadow-2xl">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32 animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16 animate-bounce"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                      <MessageSquare className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-ping"></div>
                  </div>
                  <div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 tracking-tight">
                      My <span className="gradient-text bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">Workspaces</span>
                    </h1>
                    <p className="text-indigo-100 text-lg font-medium">
                      Your collaborative spaces for innovation and teamwork
                    </p>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="flex items-center gap-6 mb-8 text-white/90">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">{rooms.filter(r => getRoomStatus(r) === 'live').length} Live</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-sm font-medium">{rooms.length} Total</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-sm font-medium">{rooms.filter(r => getRoomStatus(r) === 'active').length} Active</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/dashboard/create-room"
                    className="group relative inline-flex items-center px-8 py-4 bg-white text-indigo-600 rounded-2xl hover:bg-indigo-50 transition-all duration-300 font-bold shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/0 to-purple-600/0 group-hover:from-indigo-600/10 group-hover:to-purple-600/10 transition-all duration-300"></div>
                    <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="relative z-10">Create New Room</span>
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                  <Link
                    href="/dashboard/browse"
                    className="inline-flex items-center px-8 py-4 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all duration-300 font-semibold backdrop-blur-sm border border-white/20 hover:border-white/40"
                  >
                    <Users className="h-5 w-5 mr-2" />
                    <span>Explore All</span>
                  </Link>
                </div>
              </div>
              
              {/* Hero Image/Illustration */}
              <div className="flex-shrink-0 hidden lg:block">
                <div className="relative">
                  <div className="w-80 h-80 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    <div className="w-60 h-60 bg-white/10 rounded-full flex items-center justify-center">
                      <div className="grid grid-cols-2 gap-4 p-8">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <MessageSquare className="h-6 w-6 text-white" />
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <Video className="h-6 w-6 text-white" />
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <Star className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                    <Sparkles className="h-4 w-4 text-yellow-800" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>        {/* Enhanced Search and Controls */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search workspaces by name, description, or tags..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="block w-full pl-14 pr-6 py-4 text-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white shadow-sm hover:shadow-md"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-6 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span className="sr-only">Clear search</span>
                ✕
              </button>
            )}
          </div>
          
          {/* Enhanced Controls */}
          <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Rooms', icon: MessageSquare, count: rooms.length },
                { key: 'active', label: 'Active', icon: Activity, count: rooms.filter(r => getRoomStatus(r) === 'active').length },
                { key: 'recent', label: 'Recent', icon: Clock, count: rooms.filter(r => getRoomStatus(r) === 'recent').length },
                { key: 'favorites', label: 'Favorites', icon: Heart, count: rooms.filter(r => r.lastMessageAt && getRoomStatus(r) === 'active').length }
              ].map(({ key, label, icon: Icon, count }) => (
                <button
                  key={key}
                  onClick={() => setFilterType(key as any)}
                  className={`relative flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    filterType === key
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 scale-105'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                  <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                    filterType === key 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>
            
            {/* View and Sort Controls */}
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as any)}
                  className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                >
                  <option value="activity">Recent Activity</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="members">Most Members</option>
                  <option value="created">Recently Created</option>
                </select>
                <SortAsc className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              
              {/* View Toggle */}
              <div className="flex rounded-xl bg-gray-100 dark:bg-gray-700 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                >
                  <List className="h-4 w-4" />
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
                  <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{rooms.length}</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Total Rooms</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your workspaces</p>
              </div>
            </div>
          </div>
          
          <div className="group relative bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-800/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-emerald-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-xl">
                  <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {rooms.filter(r => getRoomStatus(r) === 'active' || getRoomStatus(r) === 'live').length}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Active Rooms</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Recent activity</p>
              </div>
            </div>
          </div>
          
          <div className="group relative bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200/50 dark:border-red-800/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-pink-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-xl">
                  <Video className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {rooms.filter(r => r.video?.active).length}
                  </div>
                  {rooms.filter(r => r.video?.active).length > 0 && (
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Live Calls</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ongoing meetings</p>
              </div>
            </div>
          </div>
          
          <div className="group relative bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-200/50 dark:border-purple-800/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-violet-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-xl">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {rooms.reduce((acc, room) => acc + (room.members?.length || 0), 0)}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Total Members</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Across all rooms</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Rooms Display */}
        {isLoading ? (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></div>
                    <div className="flex gap-2">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-8 rounded-2xl text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-lg font-semibold">Something went wrong</span>
            </div>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 border border-gray-200 dark:border-gray-700 rounded-3xl p-12 text-center">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full mx-auto flex items-center justify-center">
                {searchTerm ? (
                  <Search className="h-16 w-16 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <MessageSquare className="h-16 w-16 text-indigo-600 dark:text-indigo-400" />
                )}
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {searchTerm ? 'No matching rooms found' : 'No workspaces yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto text-lg">
              {searchTerm 
                ? 'Try adjusting your search terms or explore different filters to find what you\'re looking for.' 
                : 'Create your first collaborative workspace to start building amazing projects with your team.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard/create-room"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Workspace
              </Link>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="inline-flex items-center px-8 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 font-semibold"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Dynamic View Layout */
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredRooms.map((room) => {
              const status = getRoomStatus(room);
              return viewMode === 'grid' ? (
                // Grid View Card
                <Link
                  key={room.id}
                  href={`/dashboard/rooms/${room.id}`}
                  className="group block"
                >
                  <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-400/10 transform hover:-translate-y-2 hover:scale-[1.02]">
                    {/* Status Indicator */}
                    <div className="absolute top-4 right-4 z-10">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border ${
                        status === 'live' 
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800' 
                          : status === 'active' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                          : status === 'recent'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
                          : 'bg-gray-100 dark:bg-gray-700/30 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(status)} ${status === 'live' ? 'animate-pulse' : ''}`}></div>
                        {getStatusText(status)}
                      </div>
                    </div>

                    {/* Card Header */}
                    <div className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-xl flex items-center justify-center">
                            <MessageSquare className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 truncate">
                            {room.name}
                          </h3>
                          {room.description && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed">
                              {room.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Room Stats */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                            <Users className="h-4 w-4" />
                            <span className="font-medium">{room.members?.length ?? 0}</span>
                            <span className="text-xs">members</span>
                          </div>
                          {room.videoCallEnabled && (
                            <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                              <Video className="h-4 w-4" />
                              <span className="text-xs font-medium">Video</span>
                            </div>
                          )}
                        </div>
                        {room.lastMessageAt && (
                          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                            <Clock className="h-3.5 w-3.5" />
                            <span className="text-xs">
                              {new Date(room.lastMessageAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-6 py-4 bg-gradient-to-r from-gray-50/50 to-indigo-50/50 dark:from-gray-800/50 dark:to-indigo-900/10 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Click to enter workspace
                        </div>
                        <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform duration-300">
                          <span className="text-xs font-medium">Enter</span>
                          <ArrowRight className="h-3 w-3" />
                        </div>
                      </div>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 dark:group-hover:from-indigo-400/5 dark:group-hover:via-purple-400/5 dark:group-hover:to-pink-400/5 transition-all duration-500 pointer-events-none rounded-2xl"></div>
                  </div>
                </Link>
              ) : (
                // List View Item
                <Link
                  key={room.id}
                  href={`/dashboard/rooms/${room.id}`}
                  className="group block"
                >
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transform hover:-translate-y-1">
                    <div className="flex items-center gap-6">
                      {/* Room Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-xl flex items-center justify-center">
                          <MessageSquare className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                        </div>
                      </div>

                      {/* Room Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 truncate">
                            {room.name}
                          </h3>
                          <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${
                            status === 'live' 
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' 
                              : status === 'active' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : status === 'recent'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                              : 'bg-gray-100 dark:bg-gray-700/30 text-gray-600 dark:text-gray-400'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(status)} ${status === 'live' ? 'animate-pulse' : ''}`}></div>
                            {getStatusText(status)}
                          </div>
                        </div>
                        
                        {room.description && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-1">
                            {room.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Users className="h-4 w-4" />
                              <span className="text-sm font-medium">{room.members?.length ?? 0} members</span>
                            </div>
                            {room.videoCallEnabled && (
                              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                <Video className="h-4 w-4" />
                                <span className="text-sm font-medium">Video enabled</span>
                              </div>
                            )}
                            {room.lastMessageAt && (
                              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm">
                                  {new Date(room.lastMessageAt).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-2 transition-transform duration-300">
                            <span className="text-sm font-medium">Enter workspace</span>
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Enhanced Footer */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-gray-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Need Help?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get started with workspace management</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200">
                  <Eye className="h-4 w-4" />
                  View Guide
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors duration-200">
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


