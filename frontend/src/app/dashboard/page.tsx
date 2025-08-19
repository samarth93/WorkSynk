'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  MessageSquare, 
  Users, 
  Plus, 
  Activity,
  TrendingUp,
  Clock,
  Video,
  ArrowRight
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { roomAPI, messageAPI } from '@/lib/api';
import { Room, Message } from '@/types';
import { formatUserDisplayName } from '@/utils/auth';

interface DashboardStats {
  totalRooms: number;
  adminRooms: number;
  totalMessages: number;
  recentActivity: string;
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 0,
    adminRooms: 0,
    totalMessages: 0,
    recentActivity: 'No recent activity',
  });
  const [recentRooms, setRecentRooms] = useState<Room[]>([]);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    // Only load dashboard data if user is authenticated
    if (user && user.id) {
      loadDashboardData();
    }
  }, [user, isAuthenticated, authLoading, router]);

  const loadDashboardData = async () => {
    try {
      // Check if user is authenticated before making API calls
      if (!user || !user.id) {
        console.log('User not authenticated, skipping dashboard data load');
        return;
      }
      
      setIsLoading(true);
      
      // Load user's rooms
      const [myRooms, adminRooms] = await Promise.all([
        roomAPI.getMyRooms(),
        roomAPI.getAdminRooms(),
      ]);

      // Calculate stats
      const newStats: DashboardStats = {
        totalRooms: myRooms.length,
        adminRooms: adminRooms.length,
        totalMessages: 0, // We'll calculate this from room messages
        recentActivity: myRooms.length > 0 ? 'Active in workspace' : 'No recent activity',
      };

      // Get recent messages count from user's rooms
      let totalMessageCount = 0;
      for (const room of myRooms.slice(0, 3)) {
        try {
          const count = await messageAPI.getMessageCount(room.id);
          totalMessageCount += count;
        } catch (error) {
          console.log('Error getting message count for room:', room.id);
        }
      }

      newStats.totalMessages = totalMessageCount;
      setStats(newStats);
      
      // Set recent rooms (sorted by last message time)
      const sortedRooms = myRooms
        .sort((a, b) => {
          const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return bTime - aTime;
        })
        .slice(0, 5);
      
      setRecentRooms(sortedRooms);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while authentication is being determined
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="text-2xl font-semibold text-gray-900 mt-4">Loading...</h2>
            <p className="text-gray-600 mt-2">Checking authentication</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35) 0, transparent 40%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.35) 0, transparent 35%)'
          }} />
          <div className="relative">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
              Welcome back, {user ? formatUserDisplayName(user) : 'User'}!
            </h1>
            <p className="text-blue-100 max-w-2xl text-sm sm:text-base">
              Ready to collaborate? Track your workspace at a glance and jump back into your rooms.
            </p>
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3">
              <Link href="/dashboard/create-room" className="inline-flex items-center justify-center px-4 py-2.5 bg-white text-blue-700 rounded-lg shadow-sm hover:shadow transition-colors text-sm font-medium">
                <Plus className="h-4 w-4 mr-2" />
                New Room
              </Link>
              <Link href="/dashboard/browse" className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-500/20 text-white rounded-lg ring-1 ring-white/40 hover:bg-blue-500/30 transition-colors text-sm font-medium">
                <Users className="h-4 w-4 mr-2" />
                Browse Rooms
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">My Rooms</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalRooms}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4 flex items-center text-sm text-gray-500">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Active workspaces</span>
              <span className="sm:hidden">Active</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admin Rooms</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.adminRooms}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4 flex items-center text-sm text-gray-500">
              <Activity className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Rooms you manage</span>
              <span className="sm:hidden">Managed</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Messages</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalMessages}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4 flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Total conversations</span>
              <span className="sm:hidden">Conversations</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Video Calls</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">Active</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Video className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4 flex items-center text-sm text-green-600">
              <Video className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Video calls available</span>
              <span className="sm:hidden">Available</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Rooms */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Rooms</h2>
                <Link 
                  href="/dashboard/rooms"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  <span className="hidden sm:inline">View all</span>
                  <span className="sm:hidden">All</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              {recentRooms.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {recentRooms.map((room) => (
                    <Link
                      key={room.id}
                      href={`/dashboard/rooms/${room.id}`}
                      className="block p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{room.name}</h3>
                          <div className="mt-1 flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                              {room.members.length} members
                            </span>
                            <span className={`inline-flex items-center text-xs ${room.private ? 'text-orange-700 bg-orange-100' : 'text-green-700 bg-green-100'} px-2 py-0.5 rounded`}>
                              {room.private ? 'Private' : 'Public'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-3">
                          <div className="text-xs text-gray-400">
                            {room.lastMessageAt 
                              ? new Date(room.lastMessageAt).toLocaleDateString()
                              : 'No messages'
                            }
                          </div>
                          {room.adminId === user?.id && (
                            <div className="text-xs text-blue-600 font-medium group-hover:underline">Admin</div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No rooms yet</p>
                  <Link
                    href="/dashboard/create-room"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first room
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <Link
                  href="/dashboard/create-room"
                  className="flex items-center p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                    <Plus className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">Create Room</h3>
                    <p className="text-sm text-gray-500">Start a new workspace</p>
                  </div>
                </Link>

                <Link
                  href="/dashboard/browse"
                  className="flex items-center p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">Browse Rooms</h3>
                    <p className="text-sm text-gray-500">Join existing workspaces</p>
                  </div>
                </Link>

                <div className="flex items-center p-3 sm:p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                    <Video className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-green-600">Video Calls</h3>
                    <p className="text-sm text-green-600">Available in rooms</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
