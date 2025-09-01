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
  isGlobalAdmin: boolean;
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
  isGlobalAdmin: boolean;
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

// Enhanced type definitions for better structure

// Chat and messaging types
export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  edited?: boolean;
  editedAt?: Date;
  replyTo?: string;
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  emoji: string;
  users: string[];
  count: number;
}

// Video call types
export interface VideoCall {
  id: string;
  roomId: string;
  videoRoomId?: string;
  startedBy: string;
  startedAt: Date;
  endedAt?: Date;
  participants: VideoParticipant[];
  recordingEnabled: boolean;
  status: 'active' | 'ended' | 'paused';
}

export interface VideoParticipant {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  joinedAt: Date;
  leftAt?: Date;
  isAudioOn: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  isModerator: boolean;
  connectionQuality: 'good' | 'fair' | 'poor';
}

// Enhanced user and workspace types
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    desktop: boolean;
    sound: boolean;
    email: boolean;
    mentions: boolean;
    directMessages: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    allowDirectMessages: boolean;
    shareProfile: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    dateFormat: string;
    compactMode: boolean;
  };
}

export interface UserProfile extends User {
  settings: UserSettings;
  lastSeen: Date;
  joinedWorkspaces: string[];
  createdRooms: string[];
}

// Notification system
export interface Notification {
  id: string;
  type: 'mention' | 'direct_message' | 'room_invite' | 'call_started' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  data?: Record<string, any>;
}

// API response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// WebSocket event types
export interface WebSocketEvent {
  type: 'message' | 'user_joined' | 'user_left' | 'typing' | 'call_started' | 'call_ended';
  roomId?: string;
  userId?: string;
  data: any;
  timestamp: Date;
}

// Form validation types
export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// Theme and UI types
export interface ThemeContextValue {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  resolvedTheme: 'light' | 'dark';
  systemTheme: 'light' | 'dark';
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}
