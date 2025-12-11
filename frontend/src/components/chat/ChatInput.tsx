'use client';

import React, { useState, KeyboardEvent, useRef } from 'react';
import { Send, Smile, Paperclip, Loader2 } from 'lucide-react';
import { roomAPI } from '@/lib/api';
import { MessageType } from '@/types';

interface ChatInputProps {
  onSendMessage: (message: string, attachment?: any) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message..."
}) => {
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed && !disabled) {
      onSendMessage(trimmed);
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const uploadResult = await roomAPI.uploadFile(file);

      // Determine message type
      const type = file.type.startsWith('image/') ? MessageType.IMAGE : MessageType.FILE;

      onSendMessage(file.name, {
        type,
        attachmentUrl: uploadResult.fileUrl,
        attachmentName: uploadResult.fileName,
        attachmentType: uploadResult.fileType,
        attachmentSize: uploadResult.size
      });

      // Clear input
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 p-4 border-t border-border bg-background/95">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileSelect}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isUploading}
        className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
      >
        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
      </button>

      <div className="flex-1 relative">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-2 pr-12 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring transition-colors"
          maxLength={2000}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Smile className="w-5 h-5" />
        </button>
      </div>

      <button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ChatInput;
