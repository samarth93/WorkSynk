export async function fetchRtcToken(params?: { moderator?: boolean; roomId?: string }) {
  const q = new URLSearchParams();
  if (params?.moderator) q.set("moderator", "true");
  if (params?.roomId) q.set("roomId", params.roomId);
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/video/token?${q.toString()}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to get token");
  const { token } = await res.json();
  return token as string;
}

export async function startVideoForRoom(roomId: string, startedByUserId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/video/rooms/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ roomId, startedByUserId }),
  });
  if (!res.ok) throw new Error("Failed to start video room");
  return (await res.json()) as { videoRoomId: string };
}

export async function endVideoForRoom(roomId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/video/rooms/${roomId}/end`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to end video room");
  return await res.json();
}

// Video room management utilities
export interface VideoRoomConfig {
  roomId: string;
  maxParticipants?: number;
  recordingEnabled?: boolean;
  chatEnabled?: boolean;
  screenShareEnabled?: boolean;
}

export interface VideoParticipant {
  id: string;
  name: string;
  isAudioOn: boolean;
  isVideoOn: boolean;
  isHandRaised: boolean;
  joinedAt: Date;
}

export class VideoRoomManager {
  private roomId: string;
  private participants: Map<string, VideoParticipant> = new Map();
  
  constructor(roomId: string) {
    this.roomId = roomId;
  }
  
  async joinRoom(config: VideoRoomConfig): Promise<string> {
    try {
      const token = await fetchRtcToken({ roomId: this.roomId, moderator: false });
      return token;
    } catch (error) {
      throw new Error(`Failed to join video room: ${error}`);
    }
  }
  
  async leaveRoom(): Promise<void> {
    try {
      // Clean up local resources
      this.participants.clear();
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }
  
  addParticipant(participant: VideoParticipant): void {
    this.participants.set(participant.id, participant);
  }
  
  removeParticipant(participantId: string): void {
    this.participants.delete(participantId);
  }
  
  getParticipants(): VideoParticipant[] {
    return Array.from(this.participants.values());
  }
  
  getParticipantCount(): number {
    return this.participants.size;
  }
}

// Video call utilities
export const videoUtils = {
  // Format duration in MM:SS format
  formatDuration: (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },
  
  // Check browser support for video calling
  isVideoCallSupported: (): boolean => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  },
  
  // Request camera and microphone permissions
  requestMediaPermissions: async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Media permissions denied:', error);
      return false;
    }
  },
  
  // Get available media devices
  getAvailableDevices: async (): Promise<MediaDeviceInfo[]> => {
    try {
      return await navigator.mediaDevices.enumerateDevices();
    } catch (error) {
      console.error('Failed to get media devices:', error);
      return [];
    }
  },
};

export default videoUtils;
