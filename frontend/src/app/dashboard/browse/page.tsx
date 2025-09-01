'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Users, 
  MessageSquare, 
  Globe, 
  Lock, 
  UserPlus,
  Loader2,
  Filter
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { roomAPI } from '@/lib/api';
import { Room } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function BrowseRoomsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private'>('all');
  const [joiningRooms, setJoiningRooms] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPublicRooms();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [rooms, searchTerm, filterType]);

  const fetchPublicRooms = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // For now, we'll get all rooms and filter on the frontend
      // In a real app, you'd have a dedicated endpoint for public rooms
      const allRooms = await roomAPI.getAllRooms();
      setRooms(allRooms);
    } catch (err: unknown) {
      console.error('Failed to fetch rooms:', err);
      setError(err instanceof Error ? err.message : 'Failed to load rooms.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterRooms = () => {
    let filtered = rooms;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType === 'public') {
      filtered = filtered.filter(room => !room.private);
    } else if (filterType === 'private') {
      filtered = filtered.filter(room => room.private);
    }

    // Remove rooms the user is already a member of
    if (user) {
      filtered = filtered.filter(room => !room.members.includes(user.id));
    }

    setFilteredRooms(filtered);
  };

  const handleJoinRoom = async (roomId: string) => {
    if (!user || joiningRooms.has(roomId)) return;

    setJoiningRooms(prev => new Set(prev).add(roomId));
    try {
      await roomAPI.joinRoom(roomId);
      // Refresh the rooms list to remove the joined room
      await fetchPublicRooms();
      // Navigate to the newly joined room
      router.push(`/dashboard/rooms/${roomId}`);
    } catch (err: unknown) {
      console.error('Failed to join room:', err);
      setError(err instanceof Error ? err.message : 'Failed to join room.');
    } finally {
      setJoiningRooms(prev => {
        const newSet = new Set(prev);
        newSet.delete(roomId);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Browse Rooms</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Discover and join workspaces from across the platform</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
            <button
              onClick={fetchPublicRooms}
              className="ml-4 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search rooms by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'public' | 'private')}
                className="px-3 sm:px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700 text-sm sm:text-base"
              >
                <option value="all">All Rooms</option>
                <option value="public">Public Only</option>
                <option value="private">Private Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            Found {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} 
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Rooms Grid */}
        {filteredRooms.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <MessageSquare className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No rooms found</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm sm:text-base">
              {searchTerm 
                ? `No rooms match your search for "${searchTerm}"`
                : "There are no rooms available to join at the moment"
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200"
              >
                {/* Room Header */}
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate mb-1">
                      {room.name}
                    </h3>
                    <div className="flex items-center space-x-2 flex-wrap">
                      {room.private ? (
                        <span className="inline-flex items-center text-xs font-medium text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                          <Lock className="h-3 w-3 mr-1 flex-shrink-0" />
                          Private
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                          <Globe className="h-3 w-3 mr-1 flex-shrink-0" />
                          Public
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 sm:mb-4 line-clamp-3">
                  {room.description || 'No description provided.'}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{room.members.length}/{room.maxMembers || '∞'} members</span>
                  </div>
                  <div className="flex items-center ml-2">
                    <MessageSquare className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="hidden sm:inline">{room.videoCallEnabled ? 'Video enabled' : 'Chat only'}</span>
                    <span className="sm:hidden">{room.videoCallEnabled ? 'Video' : 'Chat'}</span>
                  </div>
                </div>

                {/* Join Button */}
                <button
                  onClick={() => handleJoinRoom(room.id)}
                  disabled={joiningRooms.has(room.id)}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {joiningRooms.has(room.id) ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Join Room
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
