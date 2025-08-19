import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Message, MessageRequest, TypingData, VideoCallData } from '@/types';

// WebSocket connection URL
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws';

export class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private token: string | null = null;
  private isConnected: boolean = false;

  // Event callbacks
  private onConnectCallback?: () => void;
  private onDisconnectCallback?: () => void;
  private onErrorCallback?: (error: unknown) => void;
  private onMessageCallback?: (message: Message) => void;
  private onTypingCallback?: (typingData: Record<string, unknown>) => void;
  private onEditMessageCallback?: (message: Message) => void;
  private onDeleteMessageCallback?: (message: Message) => void;
  private onVideoCallCallback?: (videoData: Record<string, unknown>) => void;

  /**
   * Initialize WebSocket connection
   */
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.token = token;

      this.client = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        onConnect: () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.onConnectCallback?.();
          resolve();
        },
        onDisconnect: () => {
          console.log('WebSocket disconnected');
          this.isConnected = false;
          this.onDisconnectCallback?.();
        },
        onStompError: (frame) => {
          console.error('STOMP Error:', frame);
          this.onErrorCallback?.(frame);
          reject(new Error('WebSocket connection failed'));
        },
      });

      this.client.activate();
    });
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.client) {
      this.subscriptions.clear();
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
    }
  }

  /**
   * Check if WebSocket is connected
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Subscribe to room messages
   */
  subscribeToRoom(roomId: string): void {
    if (!this.client || !this.isConnected) {
      console.error('WebSocket not connected');
      return;
    }

    // Unsubscribe from existing room subscription
    const existingSubscription = this.subscriptions.get(`room-${roomId}`);
    if (existingSubscription) {
      existingSubscription.unsubscribe();
    }

    // Subscribe to room messages
    const messageSubscription = this.client.subscribe(
      `/topic/room/${roomId}`,
      (message: IMessage) => {
        try {
          const parsedMessage: Message = JSON.parse(message.body);
          this.onMessageCallback?.(parsedMessage);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      },
      {
        Authorization: `Bearer ${this.token}`,
      }
    );

    this.subscriptions.set(`room-${roomId}`, messageSubscription);

    // Subscribe to typing indicators
    const typingSubscription = this.client.subscribe(
      `/topic/room/${roomId}/typing`,
      (message: IMessage) => {
        try {
          const typingData = JSON.parse(message.body);
          this.onTypingCallback?.(typingData);
        } catch (error) {
          console.error('Error parsing typing data:', error);
        }
      },
      {
        Authorization: `Bearer ${this.token}`,
      }
    );

    this.subscriptions.set(`typing-${roomId}`, typingSubscription);

    // Subscribe to message edits
    const editSubscription = this.client.subscribe(
      `/topic/room/${roomId}/edit`,
      (message: IMessage) => {
        try {
          const editedMessage: Message = JSON.parse(message.body);
          this.onEditMessageCallback?.(editedMessage);
        } catch (error) {
          console.error('Error parsing edit message:', error);
        }
      },
      {
        Authorization: `Bearer ${this.token}`,
      }
    );

    this.subscriptions.set(`edit-${roomId}`, editSubscription);

    // Subscribe to message deletions
    const deleteSubscription = this.client.subscribe(
      `/topic/room/${roomId}/delete`,
      (message: IMessage) => {
        try {
          const deletedMessage: Message = JSON.parse(message.body);
          this.onDeleteMessageCallback?.(deletedMessage);
        } catch (error) {
          console.error('Error parsing delete message:', error);
        }
      },
      {
        Authorization: `Bearer ${this.token}`,
      }
    );

    this.subscriptions.set(`delete-${roomId}`, deleteSubscription);

    // Subscribe to video call events (placeholder for future integration)
    const videoSubscription = this.client.subscribe(
      `/topic/room/${roomId}/video`,
      (message: IMessage) => {
        try {
          const videoData = JSON.parse(message.body);
          this.onVideoCallCallback?.(videoData);
        } catch (error) {
          console.error('Error parsing video call data:', error);
        }
      },
      {
        Authorization: `Bearer ${this.token}`,
      }
    );

    this.subscriptions.set(`video-${roomId}`, videoSubscription);

    // Join the room
    this.joinRoom(roomId);
  }

  /**
   * Unsubscribe from room
   */
  unsubscribeFromRoom(roomId: string): void {
    const subscriptionKeys = [
      `room-${roomId}`,
      `typing-${roomId}`,
      `edit-${roomId}`,
      `delete-${roomId}`,
      `video-${roomId}`,
    ];

    subscriptionKeys.forEach(key => {
      const subscription = this.subscriptions.get(key);
      if (subscription) {
        subscription.unsubscribe();
        this.subscriptions.delete(key);
      }
    });

    // Leave the room
    this.leaveRoom(roomId);
  }

  /**
   * Send a message
   */
  sendMessage(messageRequest: MessageRequest): void {
    if (!this.client || !this.isConnected) {
      console.error('WebSocket not connected');
      return;
    }

    this.client.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(messageRequest),
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  /**
   * Join a room
   */
  joinRoom(roomId: string): void {
    if (!this.client || !this.isConnected) {
      console.error('WebSocket not connected');
      return;
    }

    this.client.publish({
      destination: `/app/chat.joinRoom/${roomId}`,
      body: '',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  /**
   * Leave a room
   */
  leaveRoom(roomId: string): void {
    if (!this.client || !this.isConnected) {
      console.error('WebSocket not connected');
      return;
    }

    this.client.publish({
      destination: `/app/chat.leaveRoom/${roomId}`,
      body: '',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  /**
   * Send typing indicator
   */
  sendTyping(typingData: TypingData): void {
    if (!this.client || !this.isConnected) {
      console.error('WebSocket not connected');
      return;
    }

    this.client.publish({
      destination: '/app/chat.typing',
      body: JSON.stringify(typingData),
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  /**
   * Edit a message
   */
  editMessage(messageId: string, newText: string): void {
    if (!this.client || !this.isConnected) {
      console.error('WebSocket not connected');
      return;
    }

    this.client.publish({
      destination: '/app/chat.editMessage',
      body: JSON.stringify({ messageId, newText }),
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  /**
   * Delete a message
   */
  deleteMessage(messageId: string): void {
    if (!this.client || !this.isConnected) {
      console.error('WebSocket not connected');
      return;
    }

    this.client.publish({
      destination: '/app/chat.deleteMessage',
      body: JSON.stringify({ messageId }),
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  /**
   * Start video call (placeholder for future integration)
   */
  startVideoCall(videoData: VideoCallData): void {
    if (!this.client || !this.isConnected) {
      console.error('WebSocket not connected');
      return;
    }

    this.client.publish({
      destination: '/app/chat.startVideoCall',
      body: JSON.stringify(videoData),
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  /**
   * End video call (placeholder for future integration)
   */
  endVideoCall(videoData: VideoCallData): void {
    if (!this.client || !this.isConnected) {
      console.error('WebSocket not connected');
      return;
    }

    this.client.publish({
      destination: '/app/chat.endVideoCall',
      body: JSON.stringify(videoData),
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  // Event listener setters
  onConnect(callback: () => void): void {
    this.onConnectCallback = callback;
  }

  onDisconnect(callback: () => void): void {
    this.onDisconnectCallback = callback;
  }

  onError(callback: (error: unknown) => void): void {
    this.onErrorCallback = callback;
  }

  onMessage(callback: (message: Message) => void): void {
    this.onMessageCallback = callback;
  }

  onTyping(callback: (typingData: Record<string, unknown>) => void): void {
    this.onTypingCallback = callback;
  }

  onEditMessage(callback: (message: Message) => void): void {
    this.onEditMessageCallback = callback;
  }

  onDeleteMessage(callback: (message: Message) => void): void {
    this.onDeleteMessageCallback = callback;
  }

  onVideoCall(callback: (videoData: Record<string, unknown>) => void): void {
    this.onVideoCallCallback = callback;
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
