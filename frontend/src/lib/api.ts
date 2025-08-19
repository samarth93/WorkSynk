import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  User, 
  Room, 
  CreateRoomRequest, 
  Message, 
  MessageRequest,
  PaginationInfo
} from '@/types';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Create a more detailed error message
    let errorMessage = 'Network error';
    let errorDetails = {};
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;
      
      errorDetails = {
        status,
        data,
        url: error.config?.url,
        method: error.config?.method
      };
      
      if (data?.message) {
        errorMessage = data.message;
      } else if (status === 404) {
        errorMessage = 'Resource not found';
      } else if (status === 403) {
        errorMessage = 'Access denied';
      } else if (status === 500) {
        errorMessage = 'Server error';
      } else {
        errorMessage = `HTTP ${status} error`;
      }
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'No response from server';
      errorDetails = {
        request: error.request,
        url: error.config?.url,
        method: error.config?.method
      };
    } else {
      // Something else happened
      errorMessage = error.message || 'Unknown error';
      errorDetails = {
        message: error.message,
        name: error.name,
        url: error.config?.url,
        method: error.config?.method
      };
    }
    
    // Log the full error details for debugging
    console.error('API Error Details:', JSON.stringify(errorDetails, null, 2));
    console.error('API Error Message:', errorMessage);
    
    if (error.response?.status === 401) {
      // Clear token on unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    
    // Create a new error with the detailed message
    const enhancedError = new Error(errorMessage);
    enhancedError.name = error.name;
    enhancedError.stack = error.stack;
    
    // Add additional properties for debugging
    (enhancedError as Error & { details?: unknown; originalError?: unknown }).details = errorDetails;
    (enhancedError as Error & { details?: unknown; originalError?: unknown }).originalError = error;
    
    return Promise.reject(enhancedError);
  }
);

// Authentication API
export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await apiClient.post('/auth/login', data);
    return response.data.data!;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await apiClient.post('/auth/register', data);
      return response.data.data!;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const backendMessage = (err.response?.data as { message?: string })?.message;
        const status = err.response?.status;
        const message = backendMessage || (status ? `Registration failed (HTTP ${status})` : 'Registration failed');
        throw new Error(message);
      }
      throw new Error('Registration failed');
    }
  },

  validateToken: async (): Promise<boolean> => {
    const response: AxiosResponse<ApiResponse<boolean>> = await apiClient.get('/auth/validate');
    return response.data.data!;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  checkEmailAvailability: async (email: string): Promise<boolean> => {
    const response: AxiosResponse<ApiResponse<boolean>> = await apiClient.get(`/auth/check-email?email=${email}`);
    return response.data.data!;
  },

  checkUsernameAvailability: async (username: string): Promise<boolean> => {
    const response: AxiosResponse<ApiResponse<boolean>> = await apiClient.get(`/auth/check-username?username=${username}`);
    return response.data.data!;
  },
};

// User API
export const userAPI = {
  getCurrentUser: async (): Promise<User> => {
    const response: AxiosResponse<ApiResponse<User>> = await apiClient.get('/users/me');
    return response.data.data!;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response: AxiosResponse<ApiResponse<User>> = await apiClient.put('/users/me', data);
    return response.data.data!;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post('/users/change-password', {
      currentPassword,
      newPassword,
    });
  },

  getUserById: async (userId: string): Promise<User> => {
    const response: AxiosResponse<ApiResponse<User>> = await apiClient.get(`/users/${userId}`);
    return response.data.data!;
  },

  searchUsers: async (username: string): Promise<User[]> => {
    const response: AxiosResponse<ApiResponse<User[]>> = await apiClient.get(`/users/search?username=${username}`);
    return response.data.data!;
  },

  getUserRooms: async (): Promise<{ joinedRooms: string[], adminRooms: string[] }> => {
    const response: AxiosResponse<ApiResponse<{ joinedRooms: string[], adminRooms: string[] }>> = 
      await apiClient.get('/users/me/rooms');
    return response.data.data!;
  },

  deactivateAccount: async (): Promise<void> => {
    await apiClient.delete('/users/me');
  },
};

// Room API
export const roomAPI = {
  createRoom: async (data: CreateRoomRequest): Promise<Room> => {
    const response: AxiosResponse<ApiResponse<Room>> = await apiClient.post('/rooms', data);
    return response.data.data!;
  },

  getAllRooms: async (): Promise<Room[]> => {
    const response: AxiosResponse<ApiResponse<Room[]>> = await apiClient.get('/rooms');
    return response.data.data!;
  },

  getPublicRooms: async (): Promise<Room[]> => {
    const response: AxiosResponse<ApiResponse<Room[]>> = await apiClient.get('/rooms/public');
    return response.data.data!;
  },

  getMyRooms: async (): Promise<Room[]> => {
    const response: AxiosResponse<ApiResponse<Room[]>> = await apiClient.get('/rooms/my');
    return response.data.data!;
  },

  getAdminRooms: async (): Promise<Room[]> => {
    const response: AxiosResponse<ApiResponse<Room[]>> = await apiClient.get('/rooms/admin');
    return response.data.data!;
  },

  getRoomById: async (roomId: string): Promise<Room> => {
    const response: AxiosResponse<ApiResponse<Room>> = await apiClient.get(`/rooms/${roomId}`);
    return response.data.data!;
  },

  joinRoom: async (roomId: string): Promise<Room> => {
    const response: AxiosResponse<ApiResponse<Room>> = await apiClient.post(`/rooms/${roomId}/join`);
    return response.data.data!;
  },

  leaveRoom: async (roomId: string): Promise<Room> => {
    const response: AxiosResponse<ApiResponse<Room>> = await apiClient.post(`/rooms/${roomId}/leave`);
    return response.data.data!;
  },

  updateRoom: async (roomId: string, data: Partial<Room>): Promise<Room> => {
    const response: AxiosResponse<ApiResponse<Room>> = await apiClient.put(`/rooms/${roomId}`, data);
    return response.data.data!;
  },

  deleteRoom: async (roomId: string): Promise<void> => {
    await apiClient.delete(`/rooms/${roomId}`);
  },

  transferAdmin: async (roomId: string, newAdminId: string): Promise<Room> => {
    const response: AxiosResponse<ApiResponse<Room>> = await apiClient.post(`/rooms/${roomId}/transfer-admin`, {
      newAdminId,
    });
    return response.data.data!;
  },

  searchRooms: async (name: string): Promise<Room[]> => {
    const response: AxiosResponse<ApiResponse<Room[]>> = await apiClient.get(`/rooms/search?name=${name}`);
    return response.data.data!;
  },

  getPopularRooms: async (): Promise<Room[]> => {
    const response: AxiosResponse<ApiResponse<Room[]>> = await apiClient.get('/rooms/popular');
    return response.data.data!;
  },

  getRoomMembers: async (roomId: string): Promise<string[]> => {
    const response: AxiosResponse<ApiResponse<string[]>> = await apiClient.get(`/rooms/${roomId}/members`);
    return response.data.data!;
  },

  // Video call placeholders (for future integration)
  startVideoCall: async (roomId: string): Promise<string> => {
    const response: AxiosResponse<ApiResponse<string>> = await apiClient.post(`/rooms/${roomId}/video/start`);
    return response.data.data!;
  },

  endVideoCall: async (roomId: string): Promise<void> => {
    await apiClient.post(`/rooms/${roomId}/video/end`);
  },
};

// Message API
export const messageAPI = {
  sendMessage: async (data: MessageRequest): Promise<Message> => {
    const response: AxiosResponse<ApiResponse<Message>> = await apiClient.post('/messages', data);
    return response.data.data!;
  },

  getRoomMessages: async (roomId: string, page: number = 0, size: number = 20): Promise<{content: Message[], page: PaginationInfo}> => {
    const response: AxiosResponse<ApiResponse<{content: Message[], page: PaginationInfo}>> = 
      await apiClient.get(`/messages/room/${roomId}?page=${page}&size=${size}`);
    return response.data.data!;
  },

  getRecentRoomMessages: async (roomId: string): Promise<Message[]> => {
    const response: AxiosResponse<ApiResponse<Message[]>> = await apiClient.get(`/messages/room/${roomId}/recent`);
    return response.data.data!;
  },

  editMessage: async (messageId: string, text: string): Promise<Message> => {
    const response: AxiosResponse<ApiResponse<Message>> = await apiClient.put(`/messages/${messageId}`, { text });
    return response.data.data!;
  },

  deleteMessage: async (messageId: string): Promise<Message> => {
    const response: AxiosResponse<ApiResponse<Message>> = await apiClient.delete(`/messages/${messageId}`);
    return response.data.data!;
  },

  getMessage: async (messageId: string): Promise<Message> => {
    const response: AxiosResponse<ApiResponse<Message>> = await apiClient.get(`/messages/${messageId}`);
    return response.data.data!;
  },

  searchMessages: async (roomId: string, text: string): Promise<Message[]> => {
    const response: AxiosResponse<ApiResponse<Message[]>> = await apiClient.get(`/messages/room/${roomId}/search?text=${text}`);
    return response.data.data!;
  },

  getThreadedMessages: async (parentMessageId: string): Promise<Message[]> => {
    const response: AxiosResponse<ApiResponse<Message[]>> = await apiClient.get(`/messages/${parentMessageId}/replies`);
    return response.data.data!;
  },

  getMessageCount: async (roomId: string): Promise<number> => {
    const response: AxiosResponse<ApiResponse<number>> = await apiClient.get(`/messages/room/${roomId}/count`);
    return response.data.data!;
  },

  getLatestMessage: async (roomId: string): Promise<Message | null> => {
    const response: AxiosResponse<ApiResponse<Message | null>> = await apiClient.get(`/messages/room/${roomId}/latest`);
    return response.data.data!;
  },

  // Video call message placeholders (for future integration)
  getVideoCallMessages: async (roomId: string): Promise<Message[]> => {
    const response: AxiosResponse<ApiResponse<Message[]>> = await apiClient.get(`/messages/room/${roomId}/video-calls`);
    return response.data.data!;
  },
};

// Health API
export const healthAPI = {
  checkHealth: async (): Promise<Record<string, unknown>> => {
    const response: AxiosResponse<ApiResponse<Record<string, unknown>>> = await apiClient.get('/health');
    return response.data.data!;
  },

  getApiInfo: async (): Promise<Record<string, unknown>> => {
    const response: AxiosResponse<ApiResponse<Record<string, unknown>>> = await apiClient.get('/info');
    return response.data.data!;
  },
};

// Workspace Invite types
export interface InviteRequest {
  email: string;
  workspaceId?: string;
}

export interface VerifyInviteRequest {
  email: string;
}

export interface InviteResponse {
  id: string;
  email: string;
  workspaceId: string;
  workspaceName?: string;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  used: boolean;
  expired: boolean;
  valid: boolean;
}

// Admin API
export const adminAPI = {
  inviteUser: async (request: InviteRequest): Promise<InviteResponse> => {
    const response: AxiosResponse<ApiResponse<InviteResponse>> = await apiClient.post('/admin/invite', request);
    return response.data.data!;
  },

  getInvites: async (workspaceId?: string): Promise<InviteResponse[]> => {
    const params = workspaceId ? { workspaceId } : {};
    const response: AxiosResponse<ApiResponse<InviteResponse[]>> = await apiClient.get('/admin/invites', { params });
    return response.data.data!;
  },

  cancelInvite: async (inviteId: string): Promise<void> => {
    await apiClient.delete(`/admin/invites/${inviteId}`);
  },

  resendInvite: async (inviteId: string): Promise<InviteResponse> => {
    const response: AxiosResponse<ApiResponse<InviteResponse>> = await apiClient.post(`/admin/invites/${inviteId}/resend`);
    return response.data.data!;
  },
};

// Workspace Join API (extends auth API)
export const workspaceAPI = {
  verifyInvite: async (request: VerifyInviteRequest): Promise<InviteResponse> => {
    const response: AxiosResponse<ApiResponse<InviteResponse>> = await apiClient.post('/auth/join-workspace', request);
    return response.data.data!;
  },
};

export default apiClient;
