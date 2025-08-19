'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Send, Loader2, Video, PhoneCall } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { roomAPI, messageAPI } from '@/lib/api';
import { startVideoForRoom } from '@/lib/video';
import { Message, Room, MessageRequest } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function RoomDetailPage() {
  const params = useParams<{ roomId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const roomId = params?.roomId;
  const [room, setRoom] = useState<Room | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isStartingCall, setIsStartingCall] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadRoom = async () => {
      if (!roomId) return;
      
      // Validate room ID format (should be a MongoDB ObjectId)
      if (!/^[0-9a-fA-F]{24}$/.test(roomId)) {
        setError('Invalid room ID format. Redirecting to dashboard...');
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(undefined); // Clear any previous errors
        const roomData = await roomAPI.getRoomById(roomId);
        setRoom(roomData);
        await loadMessages();
      } catch (err: unknown) {
        console.error('Failed to load room:', err);
        
        let errorMessage = 'Failed to load room';
        
        if (err instanceof Error) {
          errorMessage = err.message;
          
          // Check for specific error types
          if (errorMessage.includes('404') || errorMessage.includes('Resource not found')) {
            errorMessage = 'Room not found. It may have been deleted or you may not have access.';
          } else if (errorMessage.includes('403') || errorMessage.includes('Access denied')) {
            errorMessage = 'Access denied. You may not have permission to view this room.';
          } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
            errorMessage = 'Please log in to access this room.';
          }
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    loadRoom();
  }, [roomId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!roomId) return;
    try {
      const roomMessages = await messageAPI.getRoomMessages(roomId, 0, 50);
      // The backend returns messages in descending order (newest first), 
      // so we need to reverse them to display in chronological order (oldest first)
      const sortedMessages = (roomMessages.content || []).reverse();
      setMessages(sortedMessages);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const handleStartVideoCall = async () => {
    if (!roomId || !user?.id) return;
    
    try {
      setIsStartingCall(true);
      await startVideoForRoom(roomId, user.id);
      // Reload room data to get updated video metadata
      const updatedRoom = await roomAPI.getRoomById(roomId);
      setRoom(updatedRoom);
    } catch (error) {
      console.error('Failed to start video call:', error);
      alert('Failed to start video call. Please try again.');
    } finally {
      setIsStartingCall(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !roomId || isSending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    try {
      const messageRequest: MessageRequest = {
        roomId,
        text: messageText,
      };
      
      const sentMessage = await messageAPI.sendMessage(messageRequest);
      
      // Add the new message to the end of the list (chronological order)
      setMessages(prev => [...prev, sentMessage]);
    } catch (err: unknown) {
      console.error('Failed to send message:', err);
      // Restore the message text if sending failed
      setNewMessage(messageText);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as unknown as React.FormEvent);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </button>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium mb-1">Error Loading Room</h3>
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={() => {
                  setError(undefined);
                  // Reload the room data
                  const loadRoom = async () => {
                    if (!roomId) return;
                    try {
                      setIsLoading(true);
                      const roomData = await roomAPI.getRoomById(roomId);
                      setRoom(roomData);
                      await loadMessages();
                    } catch (err: unknown) {
                      console.error('Failed to load room:', err);
                      const errorMessage = err instanceof Error ? err.message : 'Failed to load room';
                      setError(errorMessage);
                    } finally {
                      setIsLoading(false);
                    }
                  };
                  loadRoom();
                }}
                className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : room ? (
          <div className="flex flex-col h-[calc(100vh-12rem)] sm:h-[calc(100vh-14rem)]">
            {/* Room Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{room.name}</h1>
              {room.description && (
                <p className="text-gray-600 mt-2 text-sm sm:text-base">{room.description}</p>
              )}
              <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center text-sm text-gray-500 flex-wrap gap-2">
                  <span>{room.members?.length || 0} members</span>
                  {room.private && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                      Private
                    </span>
                  )}
                </div>
                
                {/* Video Call Buttons */}
                <div className="flex items-center gap-2">
                  {room.video?.active && room.video?.videoRoomId ? (
                    <Link
                      href={`/dashboard/rooms/${roomId}/call`}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                    >
                      <PhoneCall className="h-4 w-4" />
                      Join Call
                    </Link>
                  ) : room.adminId === user?.id ? (
                    <button
                      onClick={handleStartVideoCall}
                      disabled={isStartingCall}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                    >
                      {isStartingCall ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Video className="h-4 w-4" />
                      )}
                      {isStartingCall ? 'Starting...' : 'Start Call'}
                    </button>
                  ) : (
                    <div className="text-sm text-gray-500 px-3 py-2">
                      <Video className="h-4 w-4 inline mr-1" />
                      Video calls available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col min-h-0">
              {/* Messages Header */}
              <div className="border-b border-gray-200 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                  <button
                    onClick={loadMessages}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {/* Messages List */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4"
              >
                {messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm sm:text-base">No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 sm:py-3 rounded-lg ${
                            message.senderId === user?.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          {message.senderId !== user?.id && (
                            <div className="text-xs font-medium mb-1 opacity-75 truncate">
                              {message.senderUsername}
                            </div>
                          )}
                          <div className="text-sm sm:text-base break-words">{message.text}</div>
                          <div
                            className={`text-xs mt-1 ${
                              message.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-3 sm:p-4">
                <form onSubmit={handleSendMessage} className="flex items-end space-x-2 sm:space-x-3">
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      rows={1}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 bg-white placeholder-gray-500 text-sm sm:text-base"
                      disabled={isSending}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}


