"use client";

import { MeetingProvider, useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import ReactPlayer from "react-player";
import { useEffect, useMemo, useState, useCallback } from "react";
import { AlertCircle, Loader2, Video, Mic, MicOff, VideoOff } from "lucide-react";
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
    <div className="rounded-xl p-4 shadow-lg border bg-white">
      <div className="text-sm mb-3 font-medium text-gray-800">
        {isLocal ? "You" : `Participant ${participantId.slice(0, 8)}`}
      </div>
      {mediaStream ? (
        <div className="relative">
          <video 
            autoPlay 
            muted={isLocal} 
            style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
            ref={(node) => {
              if (node) node.srcObject = mediaStream;
            }}
          />
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1">
            {micOn ? <Mic className="h-4 w-4 text-white" /> : <MicOff className="h-4 w-4 text-white" />}
          </div>
        </div>
      ) : (
        <div className="h-48 grid place-items-center text-sm opacity-60 bg-gray-100 rounded-lg">
          <div className="text-center">
            <VideoOff className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>{isLocal ? "Your camera is off" : "No video"}</p>
          </div>
        </div>
      )}
      <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          {micOn ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
          {micOn ? "Mic on" : "Mic off"}
        </span>
        <span className="flex items-center gap-1">
          {webcamOn ? <Video className="h-3 w-3" /> : <VideoOff className="h-3 w-3" />}
          {webcamOn ? "Cam on" : "Cam off"}
        </span>
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
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
        <h3 className="text-xl font-semibold mb-2 text-gray-800">Connection Error</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
        <div className="space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={handleLeave}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Leave Call
          </button>
        </div>
      </div>
    );
  }

  if (isConnecting || !hasJoined) {
    return (
      <div className="text-center p-8">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600 text-lg">Connecting to call...</p>
        <p className="text-gray-500 text-sm mt-2">Please wait while we establish your connection</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex gap-4 justify-center">
        <button 
          onClick={handleToggleMic} 
          className={`px-6 py-3 rounded-xl border shadow transition-colors flex items-center gap-2 ${
            localMicOn 
              ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
              : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
          }`}
        >
          {localMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          <span>{localMicOn ? "Mic On" : "Mic Off"}</span>
        </button>
        <button 
          onClick={handleToggleWebcam} 
          className={`px-6 py-3 rounded-xl border shadow transition-colors flex items-center gap-2 ${
            localWebcamOn 
              ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
              : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
          }`}
        >
          {localWebcamOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          <span>{localWebcamOn ? "Camera On" : "Camera Off"}</span>
        </button>
        <button 
          onClick={handleLeave} 
          className="px-6 py-3 rounded-xl border shadow bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <span>📞</span>
          <span>Leave Call</span>
        </button>
      </div>

      {/* Participants Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {participants.size === 0 ? (
          <div className="col-span-full text-center p-12">
            <div className="text-gray-400 mb-4">
              <Video className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Waiting for others to join</h3>
            <p className="text-gray-500">You&apos;re the first one here. Share the room link with others!</p>
          </div>
        ) : (
          [...participants.keys()].map(pid => (
            <ParticipantTile key={pid} participantId={pid} />
          ))
        )}
      </div>

      {/* Connection Status */}
      <div className="text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
          hasJoined 
            ? 'bg-green-100 text-green-700' 
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            hasJoined ? 'bg-green-500' : 'bg-yellow-500'
          }`}></div>
          {hasJoined ? "Connected to call" : "Connecting..."}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Meeting ID: {meetingId}
        </p>
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
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600 text-lg">Loading video call...</p>
      </div>
    );
  }

  // Validate inputs
  if (!token || !meetingId) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
        <h3 className="text-xl font-semibold mb-2 text-gray-800">Invalid Call Configuration</h3>
        <p className="text-gray-600 mb-4">
          Missing required call information. Please try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reload
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border p-6">
      {sdkError ? (
        <div className="text-center p-8">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Video SDK Error</h3>
          <p className="text-gray-600 mb-4">{sdkError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
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
