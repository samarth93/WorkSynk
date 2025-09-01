"use client";

import { MeetingProvider, useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import ReactPlayer from "react-player";
import { useEffect, useMemo, useState, useCallback } from "react";
import { 
  AlertCircle, 
  Loader2, 
  Video, 
  Mic, 
  MicOff, 
  VideoOff,
  Phone,
  PhoneOff,
  Users,
  Settings,
  Share2,
  MessageSquare,
  MoreHorizontal,
  Wifi,
  WifiOff,
  Clock,
  Volume2,
  VolumeX
} from "lucide-react";
import { useRouter } from "next/navigation";

// Check if we're on the client side
const isClient = typeof window !== 'undefined';

function ParticipantTile({ participantId }: { participantId: string }) {
  const { webcamStream, micStream, webcamOn, micOn, isLocal } = useParticipant(participantId);
  const mediaStream = useMemo(() => {
    if (!webcamOn || !webcamStream) return null;
    const stream = new MediaStream();
    stream.addTrack(webcamStream.track);
    return stream;
  }, [webcamOn, webcamStream]);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Participant Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 border-b border-gray-100 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isLocal ? 'bg-blue-500 dark:bg-blue-400' : 'bg-green-500 dark:bg-green-400'}`}></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isLocal ? "You" : `Participant ${participantId.slice(0, 8)}`}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            {micOn ? (
              <Mic className="h-3 w-3 text-green-600 dark:text-green-400" />
            ) : (
              <MicOff className="h-3 w-3 text-red-600 dark:text-red-400" />
            )}
            {webcamOn ? (
              <Video className="h-3 w-3 text-green-600 dark:text-green-400" />
            ) : (
              <VideoOff className="h-3 w-3 text-red-600 dark:text-red-400" />
            )}
          </div>
        </div>
      </div>
      
      {/* Video/Avatar */}
      <div className="relative">
        {mediaStream ? (
          <video 
            autoPlay 
            muted={isLocal} 
            className="w-full h-48 object-cover"
            ref={(node) => {
              if (node) node.srcObject = mediaStream;
            }}
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-gray-600 dark:text-gray-300">
                  {isLocal ? "You" : participantId.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {isLocal ? "Your camera is off" : "Camera off"}
              </p>
            </div>
          </div>
        )}
        
        {/* Status Overlay */}
        <div className="absolute top-2 right-2 bg-black dark:bg-gray-800 bg-opacity-50 dark:bg-opacity-70 rounded-full p-1">
          {micOn ? (
            <Mic className="h-4 w-4 text-white" />
          ) : (
            <MicOff className="h-4 w-4 text-white" />
          )}
        </div>
      </div>
      
      {/* Participant Info */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
          <span className="flex items-center gap-1">
            {micOn ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
            {micOn ? "Mic on" : "Mic off"}
          </span>
          <span className="flex items-center gap-1">
            {webcamOn ? <Video className="h-3 w-3" /> : <VideoOff className="h-3 w-3" />}
            {webcamOn ? "Camera on" : "Camera off"}
          </span>
        </div>
      </div>
    </div>
  );
}

function MeetingView() {
  const router = useRouter();
  const { 
    participants, 
    join, 
    leave, 
    toggleMic, 
    toggleWebcam, 
    meetingId, 
    localMicOn,
    localWebcamOn
  } = useMeeting();
  
  const [error, setError] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Memoize the join function to prevent infinite loops
  const joinMeeting = useCallback(async () => {
    if (hasJoined || isConnecting) return;
    
    try {
      setIsConnecting(true);
      setError(null);
      console.log("Attempting to join meeting:", meetingId);
      await join();
      setHasJoined(true);
      console.log("Successfully joined meeting");
    } catch (err) {
      console.error("Join error:", err);
      setError("Failed to join meeting. Please check your connection and try again.");
    } finally {
      setIsConnecting(false);
    }
  }, [join, meetingId, hasJoined, isConnecting]);

  // Only run once when component mounts
  useEffect(() => { 
    joinMeeting();
  }, []); // Empty dependency array - only run once

  const handleLeave = () => {
    try {
      console.log("Leaving meeting");
      leave();
      // Redirect back to room after leaving
      setTimeout(() => {
        // Extract room ID from the current URL path
        const pathParts = window.location.pathname.split('/');
        const roomIdIndex = pathParts.findIndex(part => part === 'rooms') + 1;
        const roomId = pathParts[roomIdIndex];
        
        if (roomId) {
          router.push(`/dashboard/rooms/${roomId}`);
        } else {
          // Fallback to dashboard if room ID not found
          router.push('/dashboard');
        }
      }, 1000);
    } catch (err) {
      console.error("Leave error:", err);
      // Force redirect anyway
      const pathParts = window.location.pathname.split('/');
      const roomIdIndex = pathParts.findIndex(part => part === 'rooms') + 1;
      const roomId = pathParts[roomIdIndex];
      
      if (roomId) {
        router.push(`/dashboard/rooms/${roomId}`);
      } else {
        router.push('/dashboard');
      }
    }
  };

  const handleToggleMic = () => {
    try {
      toggleMic();
    } catch (err) {
      console.error("Toggle mic error:", err);
    }
  };

  const handleToggleWebcam = () => {
    try {
      toggleWebcam();
    } catch (err) {
      console.error("Toggle webcam error:", err);
    }
  };
  
  if (error) {
    return (
      <div className="text-center p-8">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Connection Error</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">{error}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-6 py-3 bg-blue-600 dark:bg-blue-600 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            <Loader2 className="h-5 w-5 mr-2" />
            Try Again
          </button>
          <button
            onClick={handleLeave}
            className="inline-flex items-center px-6 py-3 bg-red-600 dark:bg-red-600 text-white rounded-xl hover:bg-red-700 dark:hover:bg-red-700 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            <PhoneOff className="h-5 w-5 mr-2" />
            Leave Call
          </button>
        </div>
      </div>
    );
  }

  if (isConnecting || !hasJoined) {
    return (
      <div className="text-center p-8">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 dark:border-t-blue-300 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s' }}></div>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Connecting to Call</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">Please wait while we establish your connection</p>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Wifi className="h-4 w-4" />
          <span>Establishing connection...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Enhanced Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-wrap gap-4 justify-center">
          {/* Mic Control */}
          <button 
            onClick={handleToggleMic} 
            className={`px-6 py-4 rounded-xl border-2 shadow-lg transition-all duration-200 flex items-center gap-3 font-medium ${
              localMicOn 
                ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700/50 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 hover:shadow-xl' 
                : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700/50 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 hover:shadow-xl'
            }`}
          >
            {localMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            <span>{localMicOn ? "Mic On" : "Mic Off"}</span>
          </button>
          
          {/* Camera Control */}
          <button 
            onClick={handleToggleWebcam} 
            className={`px-6 py-4 rounded-xl border-2 shadow-lg transition-all duration-200 flex items-center gap-3 font-medium ${
              localWebcamOn 
                ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700/50 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 hover:shadow-xl' 
                : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700/50 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 hover:shadow-xl'
            }`}
          >
            {localWebcamOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            <span>{localWebcamOn ? "Camera On" : "Camera Off"}</span>
          </button>
          
          {/* Leave Call */}
          <button 
            onClick={handleLeave} 
            className="px-6 py-4 rounded-xl border-2 shadow-lg bg-red-600 dark:bg-red-600 text-white hover:bg-red-700 dark:hover:bg-red-700 transition-all duration-200 flex items-center gap-3 font-medium hover:shadow-xl"
          >
            <PhoneOff className="h-6 w-6" />
            <span>Leave Call</span>
          </button>
          
          {/* Additional Controls */}
          <button className="px-6 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 flex items-center gap-3 font-medium hover:shadow-xl">
            <Share2 className="h-6 w-6" />
            <span>Share</span>
          </button>
          
          <button className="px-6 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 flex items-center gap-3 font-medium hover:shadow-xl">
            <MessageSquare className="h-6 w-6" />
            <span>Chat</span>
          </button>
          
          <button className="px-6 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 flex items-center gap-3 font-medium hover:shadow-xl">
            <Settings className="h-6 w-6" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Participants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {participants.size === 0 ? (
          <div className="col-span-full text-center p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Waiting for others to join</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">You're the first one here. Share the room link with others!</p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span>Call started recently</span>
            </div>
          </div>
        ) : (
          [...participants.keys()].map(pid => (
            <ParticipantTile key={pid} participantId={pid} />
          ))
        )}
      </div>

      {/* Enhanced Connection Status */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${
              hasJoined 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                hasJoined ? 'bg-green-500 dark:bg-green-400' : 'bg-yellow-500 dark:bg-yellow-400'
              }`}></div>
              {hasJoined ? "Connected to call" : "Connecting..."}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <Users className="h-4 w-4" />
              <span>{participants.size + 1} participants</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Meeting ID: {meetingId}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CallPanel({ token, meetingId, name }: { token: string; meetingId: string; name: string }) {
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [participantId, setParticipantId] = useState<string>('');

  // Generate participant ID on mount to avoid hydration issues
  useEffect(() => {
    setParticipantId(`user-${Math.random().toString(36).substr(2, 9)}`);
  }, []);

  // Don't render on server side
  if (!isClient) {
    return (
      <div className="text-center p-8">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s' }}></div>
        </div>
        <p className="text-gray-600 text-lg font-medium">Loading video call...</p>
      </div>
    );
  }

  // Validate inputs
  if (!token || !meetingId) {
    return (
      <div className="text-center p-8">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-10 w-10 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-gray-800">Invalid Call Configuration</h3>
        <p className="text-gray-600 mb-4">
          Missing required call information. Please try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
        >
          <Loader2 className="h-5 w-5 mr-2" />
          Reload
        </button>
      </div>
    );
  }

  return (
    <div>
      {sdkError ? (
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Video SDK Error</h3>
          <p className="text-gray-600 mb-4">{sdkError}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            <Loader2 className="h-5 w-5 mr-2" />
            Try Again
          </button>
        </div>
      ) : (
        <MeetingProvider 
          token={token} 
          config={{ 
            meetingId, 
            name, 
            micEnabled: true, 
            webcamEnabled: true, 
            multiStream: true,
            participantId: participantId || 'user-default', // Use generated ID or fallback
            debugMode: false
          }}
        >
          <MeetingView />
        </MeetingProvider>
      )}
    </div>
  );
}
