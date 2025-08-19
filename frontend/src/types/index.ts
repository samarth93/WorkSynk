// User types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  designation?: string;
  role?: string;
  bio?: string;
  status?: string;
  joinedRooms: string[];
  adminRooms: string[];
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  videoCallEnabled: boolean;
  videoCallUserPreferences?: string;
}

// Authentication types
export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

// Room types
export interface Room {
  id: string;
  name: string;
  description?: string;
  adminId: string;
  members: string[];
  createdAt: string;
  lastMessageAt?: string;
  active: boolean;
  private: boolean;
  maxMembers: number;
  allowFileSharing: boolean;
  videoCallEnabled: boolean;
  videoCallRoomId?: string;
  maxVideoParticipants: number;
  memberCount?: number;
  video?: {
    provider?: string;
    videoRoomId?: string;
    active?: boolean;
    lastStartedBy?: string;
    lastStartedAt?: string;
  };
}

export interface CreateRoomRequest {
  name: string;
  description?: string;
  isPrivate?: boolean;
  maxMembers?: number;
  videoCallEnabled?: boolean;
  maxVideoParticipants?: number;
}

// Message types
export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderUsername: string;
  text: string;
  createdAt: string;
  editedAt?: string;
  isEdited: boolean;
  isDeleted: boolean;
  type: MessageType;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
  attachmentSize?: number;
  reactions?: string;
  parentMessageId?: string;
  replyCount: number;
  videoCallData?: string;
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  VIDEO_CALL_START = 'VIDEO_CALL_START',
  VIDEO_CALL_END = 'VIDEO_CALL_END',
  SYSTEM = 'SYSTEM'
}

export interface MessageRequest {
  roomId: string;
  text: string;
  parentMessageId?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

// WebSocket types
export interface TypingData {
  roomId: string;
  username: string;
  isTyping: boolean;
}

export interface VideoCallData {
  roomId: string;
  videoCallData?: string;
}

// UI State types
export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isConnected: boolean;
  typingUsers: Set<string>;
}

export interface RoomState {
  rooms: Room[];
  currentRoom?: Room;
  isLoading: boolean;
}

export interface AuthState {
  user?: User;
  token?: string;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Utility types
export interface PaginationInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ErrorInfo {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Navigation types
export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

// Video call types (for future integration)
export interface VideoCallState {
  isInCall: boolean;
  roomId?: string;
  participants: string[];
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
}

export interface VideoCallSettings {
  defaultAudioEnabled: boolean;
  defaultVideoEnabled: boolean;
  preferredResolution: string;
  backgroundBlur: boolean;
}
