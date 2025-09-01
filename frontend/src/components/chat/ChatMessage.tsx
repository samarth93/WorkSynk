'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessageProps {
  id: string;
  content: string;
  senderName: string;
  timestamp: Date;
  isOwnMessage?: boolean;
  avatar?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  id,
  content,
  senderName,
  timestamp,
  isOwnMessage = false,
  avatar
}) => {
  return (
    <div className={`flex gap-3 p-3 hover:bg-accent/50 transition-colors ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
        {avatar ? (
          <img src={avatar} alt={senderName} className="w-full h-full rounded-full object-cover" />
        ) : (
          senderName.charAt(0).toUpperCase()
        )}
      </div>
      
      <div className={`flex-1 space-y-1 ${isOwnMessage ? 'text-right' : ''}`}>
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-foreground">{senderName}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </span>
        </div>
        
        <div className={`text-sm text-foreground break-words ${isOwnMessage ? 'bg-primary text-primary-foreground rounded-lg px-3 py-2 inline-block' : ''}`}>
          {content}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
