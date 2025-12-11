'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Send, Loader2, Video, PhoneCall, X, Users, Paperclip } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { roomAPI, messageAPI } from '@/lib/api';
import { startVideoForRoom } from '@/lib/video';
import { Message, Room, MessageRequest, User, MessageType } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import ChatInput from '@/components/chat/ChatInput';

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
  const [members, setMembers] = useState<User[]>([]);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const loadMembers = async () => {
    if (!roomId) return;
    try {
      const memberDetails = await roomAPI.getRoomMemberDetails(roomId);
      setMembers(memberDetails);
      setIsMembersModalOpen(true);
    } catch (err) {
      console.error('Failed to load members:', err);
    }
  };

  const handleMessageUser = async (targetUserId: string) => {
    try {
      const dmRoom = await roomAPI.getOrCreateDirectRoom(targetUserId);
      setIsMembersModalOpen(false);
      router.push(`/dashboard/rooms/${dmRoom.id}`);
    } catch (err) {
      console.error('Failed to create DM:', err);
    }
  };

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

  const handleSendMessage = async (text: string, attachment?: any) => {
    if ((!text.trim() && !attachment) || !room || !user) return;

    try {
      setIsSending(true);
      const messageData: MessageRequest = {
        roomId: room.id,
        text: text,
        ...attachment
      };

      const newMessage = await messageAPI.sendMessage(messageData);
      setMessages(prev => [...prev, newMessage]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm sm:text-base"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </button>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">
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
                className="ml-4 px-3 py-1 bg-red-600 dark:bg-red-600 text-white rounded text-sm hover:bg-red-700 dark:hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : room ? (
          <div className="flex flex-col h-[calc(100vh-12rem)] sm:h-[calc(100vh-14rem)]">
            {/* Room Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{room.name}</h1>
              {room.description && (
                <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base">{room.description}</p>
              )}
              <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 flex-wrap gap-2">
                  <button
                    onClick={loadMembers}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors underline decoration-dotted underline-offset-2"
                  >
                    {room.members?.length || 0} members
                  </button>
                  {room.private && (
                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs">
                      Private
                    </span>
                  )}
                </div>

                {/* Video Call Buttons */}
                <div className="flex items-center gap-2">
                  {room.video?.active && room.video?.videoRoomId ? (
                    <Link
                      href={`/dashboard/rooms/${roomId}/call`}
                      className="bg-green-600 dark:bg-green-600 hover:bg-green-700 dark:hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                    >
                      <PhoneCall className="h-4 w-4" />
                      Join Call
                    </Link>
                  ) : room.adminId === user?.id ? (
                    <button
                      onClick={handleStartVideoCall}
                      disabled={isStartingCall}
                      className="bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                    >
                      {isStartingCall ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Video className="h-4 w-4" />
                      )}
                      {isStartingCall ? 'Starting...' : 'Start Call'}
                    </button>
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400 px-3 py-2">
                      <Video className="h-4 w-4 inline mr-1" />
                      Video calls available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col min-h-0">
              {/* Messages Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Messages</h2>
                  <button
                    onClick={loadMessages}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
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
                  <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
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
                          className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 sm:py-3 rounded-lg ${message.senderId === user?.id
                            ? 'bg-blue-600 dark:bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                            }`}
                        >
                          {message.senderId !== user?.id && (
                            <div className="text-xs font-medium mb-1 opacity-75 truncate">
                              {message.senderUsername}
                            </div>
                          )}
                          {message.type === MessageType.IMAGE && message.attachmentUrl && (
                            <img
                              src={message.attachmentUrl}
                              alt={message.attachmentName || 'Image'}
                              className="max-w-full rounded-lg mb-2 max-h-64 object-contain cursor-pointer"
                              onClick={() => window.open(message.attachmentUrl, '_blank')}
                            />
                          )}
                          {message.type === MessageType.FILE && message.attachmentUrl && (
                            <a
                              href={message.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 bg-black/10 dark:bg-white/10 rounded mb-2 hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
                            >
                              <Paperclip className="w-4 h-4" />
                              <span className="text-sm truncate underline">{message.attachmentName || 'File'}</span>
                            </a>
                          )}
                          <div className="text-sm sm:text-base break-words">{message.text}</div>
                          <div
                            className={`text-xs mt-1 ${message.senderId === user?.id
                              ? 'text-blue-100 dark:text-blue-200'
                              : 'text-gray-500 dark:text-gray-400'
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
              <ChatInput
                onSendMessage={handleSendMessage}
                disabled={isSending}
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Members Modal */}
      {isMembersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col shadow-xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Room Members</h3>
              <button
                onClick={() => setIsMembersModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-3">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {member.firstName?.[0] || member.username[0]}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">@{member.username}</p>
                    </div>
                  </div>
                  {member.id !== user?.id && (
                    <button
                      onClick={() => handleMessageUser(member.id)}
                      className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      Message
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}


