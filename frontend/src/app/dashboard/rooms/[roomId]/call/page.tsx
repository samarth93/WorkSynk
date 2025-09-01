'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Loader2, 
  AlertCircle, 
  ArrowLeft, 
  Video, 
  Users, 
  Clock,
  Wifi,
  WifiOff,
  Shield,
  Phone,
  PhoneOff,
  Settings,
  Maximize2,
  Minimize2
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import CallPanel to prevent SSR issues with VideoSDK
const CallPanel = dynamic(() => import('./CallPanel'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 dark:border-t-blue-300 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s' }}></div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Initializing video call...</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Setting up your connection</p>
      </div>
    </div>
  ),
});

interface Room {
  id: string;
  name: string;
  description?: string;
  memberCount?: number;
  video?: {
    provider: string;
    videoRoomId: string;
    active: boolean;
    lastStartedBy?: string;
    lastStartedAt?: string;
  };
}

export default function VideoCallPage() {
  const params = useParams<{ roomId: string }>();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [videoToken, setVideoToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const roomId = params?.roomId as string;

  useEffect(() => {
    if (isLoading) return; // Wait for auth to load

    if (!isAuthenticated || !user) {
      router.push('/auth/login');
      return;
    }

    loadCallData();
  }, [isAuthenticated, user, isLoading, roomId]);

  const loadCallData = async () => {
    if (!roomId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch room data
      const roomRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/rooms/${roomId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!roomRes.ok) {
        if (roomRes.status === 404) {
          throw new Error("Room not found. It may have been deleted or you don't have access.");
        } else if (roomRes.status === 403) {
          throw new Error("You don't have permission to access this room.");
        } else {
          throw new Error("Failed to load room. Please try again.");
        }
      }

      const roomData = await roomRes.json();
      const roomInfo = roomData.data;

      if (!roomInfo?.video?.videoRoomId || !roomInfo.video?.active) {
        setError("No active call found for this room. Ask an admin to start a call.");
        setLoading(false);
        return;
      }

      setRoom(roomInfo);

      // Fetch VideoSDK token
      const tokenRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/video/token?moderator=false&roomId=${roomInfo.id}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!tokenRes.ok) {
        throw new Error("Failed to get video token. Please try again.");
      }

      const { token } = await tokenRes.json();
      setVideoToken(token);

    } catch (err) {
      console.error('Error loading call data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load call data');
    } finally {
      setLoading(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Show loading while auth is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 dark:border-t-blue-300 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s' }}></div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Loading...</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Checking authentication</p>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-red-900/20 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Authentication Required</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">Please log in to join the video call.</p>
          <Link
            href="/auth/login"
            className="inline-flex items-center px-6 py-3 bg-blue-600 dark:bg-blue-600 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            <Shield className="h-5 w-5 mr-2" />
            Log In
          </Link>
        </div>
      </div>
    );
  }

  // Show loading while fetching call data
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 dark:border-t-blue-300 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s' }}></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Preparing Your Call</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Loading room information and setting up video connection...</p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Wifi className="h-4 w-4" />
            <span>Checking connection</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error if call data failed to load
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-red-900/20 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Call Error</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={loadCallData}
              className="inline-flex items-center px-6 py-3 bg-blue-600 dark:bg-blue-600 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              <Loader2 className="h-5 w-5 mr-2" />
              Try Again
            </button>
            <Link
              href={`/dashboard/rooms/${roomId}`}
              className="inline-flex items-center px-6 py-3 bg-gray-600 dark:bg-gray-600 text-white rounded-xl hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Room
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show call interface if everything is loaded
  if (room && videoToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <Link
                  href={`/dashboard/rooms/${roomId}`}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <Video className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    {room.name}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {room.memberCount || 0} members • 
                    <Clock className="h-3 w-3 ml-2 mr-1" />
                    Live call
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Connection Status */}
                <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Connected</span>
                </div>
                
                {/* Fullscreen Toggle */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </button>
                
                {/* Settings */}
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Call Interface */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Call Info Bar */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-5 w-5" />
                    <span className="font-medium">Video Call</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Wifi className="h-4 w-4" />
                    <span className="text-sm">HD Quality</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Live</span>
                </div>
              </div>
            </div>
            
            {/* Call Panel */}
            <div className="p-6">
              <CallPanel 
                token={videoToken} 
                meetingId={room.video!.videoRoomId} 
                name={user.username || user.email || "Guest"} 
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Call</h1>
        <p className="text-gray-600 mb-8">There was an unexpected error. Please try again.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            <Loader2 className="h-5 w-5 mr-2" />
            Reload Page
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
