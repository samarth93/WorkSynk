'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import CallPanel to prevent SSR issues with VideoSDK
const CallPanel = dynamic(() => import('./CallPanel'), {
  ssr: false,
  loading: () => (
    <div className="text-center p-8">
      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
      <p className="text-gray-600 text-lg">Loading video call...</p>
    </div>
  ),
});

interface Room {
  id: string;
  name: string;
  video?: {
    provider: string;
    videoRoomId: string;
    active: boolean;
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
        throw new Error("Failed to load room");
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
        throw new Error("Failed to get video token");
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

  // Show loading while auth is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Please log in to join the call.</p>
        </div>
      </div>
    );
  }

  // Show loading while fetching call data
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading call...</p>
        </div>
      </div>
    );
  }

  // Show error if call data failed to load
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <h1 className="text-xl font-semibold mb-2">Call Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push(`/dashboard/rooms/${roomId}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Room
          </button>
        </div>
      </div>
    );
  }

  // Show call interface if everything is loaded
  if (room && videoToken) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">Video Call — {room.name}</h1>
            <p className="text-gray-600">Connected as {user.username || user.email}</p>
          </div>
          <CallPanel 
            token={videoToken} 
            meetingId={room.video!.videoRoomId} 
            name={user.username || user.email || "Guest"} 
          />
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
        <p className="text-gray-600">Unable to load call. Please try again.</p>
      </div>
    </div>
  );
}
