package com.workspace.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * Message Entity for workspace application
 * Represents a chat message within a room
 */
@Document(collection = "messages")
public class Message {
    
    @Id
    private String id;
    
    @NotBlank(message = "Room ID is required")
    private String roomId;
    
    @NotBlank(message = "Sender ID is required")
    private String senderId;
    
    private String senderUsername; // Cached for faster display
    
    @NotBlank(message = "Message text is required")
    @Size(max = 2000, message = "Message cannot exceed 2000 characters")
    private String text;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    private LocalDateTime editedAt;
    private boolean isEdited = false;
    private boolean isDeleted = false;
    
    // Message types
    private MessageType type = MessageType.TEXT;
    
    // File attachment support (for future)
    private String attachmentUrl;
    private String attachmentName;
    private String attachmentType;
    private long attachmentSize;
    
    // Message reactions (for future)
    private String reactions; // JSON string for emoji reactions
    
    // Reply/Thread support (for future)
    private String parentMessageId; // For threaded conversations
    private int replyCount = 0;
    
    // Video call related messages (for future integration)
    private String videoCallData; // JSON string for video call session data
    
    public enum MessageType {
        TEXT,
        IMAGE,
        FILE,
        VIDEO_CALL_START,
        VIDEO_CALL_END,
        SYSTEM // For system messages like user joined/left
    }
    
    // Constructors
    public Message() {}
    
    public Message(String roomId, String senderId, String senderUsername, String text) {
        this.roomId = roomId;
        this.senderId = senderId;
        this.senderUsername = senderUsername;
        this.text = text;
        this.createdAt = LocalDateTime.now();
    }
    
    public Message(String roomId, String senderId, String senderUsername, String text, MessageType type) {
        this(roomId, senderId, senderUsername, text);
        this.type = type;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getRoomId() {
        return roomId;
    }
    
    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }
    
    public String getSenderId() {
        return senderId;
    }
    
    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }
    
    public String getSenderUsername() {
        return senderUsername;
    }
    
    public void setSenderUsername(String senderUsername) {
        this.senderUsername = senderUsername;
    }
    
    public String getText() {
        return text;
    }
    
    public void setText(String text) {
        this.text = text;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getEditedAt() {
        return editedAt;
    }
    
    public void setEditedAt(LocalDateTime editedAt) {
        this.editedAt = editedAt;
    }
    
    public boolean isEdited() {
        return isEdited;
    }
    
    public void setEdited(boolean edited) {
        isEdited = edited;
    }
    
    public boolean isDeleted() {
        return isDeleted;
    }
    
    public void setDeleted(boolean deleted) {
        isDeleted = deleted;
    }
    
    public MessageType getType() {
        return type;
    }
    
    public void setType(MessageType type) {
        this.type = type;
    }
    
    public String getAttachmentUrl() {
        return attachmentUrl;
    }
    
    public void setAttachmentUrl(String attachmentUrl) {
        this.attachmentUrl = attachmentUrl;
    }
    
    public String getAttachmentName() {
        return attachmentName;
    }
    
    public void setAttachmentName(String attachmentName) {
        this.attachmentName = attachmentName;
    }
    
    public String getAttachmentType() {
        return attachmentType;
    }
    
    public void setAttachmentType(String attachmentType) {
        this.attachmentType = attachmentType;
    }
    
    public long getAttachmentSize() {
        return attachmentSize;
    }
    
    public void setAttachmentSize(long attachmentSize) {
        this.attachmentSize = attachmentSize;
    }
    
    public String getReactions() {
        return reactions;
    }
    
    public void setReactions(String reactions) {
        this.reactions = reactions;
    }
    
    public String getParentMessageId() {
        return parentMessageId;
    }
    
    public void setParentMessageId(String parentMessageId) {
        this.parentMessageId = parentMessageId;
    }
    
    public int getReplyCount() {
        return replyCount;
    }
    
    public void setReplyCount(int replyCount) {
        this.replyCount = replyCount;
    }
    
    public String getVideoCallData() {
        return videoCallData;
    }
    
    public void setVideoCallData(String videoCallData) {
        this.videoCallData = videoCallData;
    }
    
    // Helper methods
    public void markAsEdited() {
        this.isEdited = true;
        this.editedAt = LocalDateTime.now();
    }
    
    public void markAsDeleted() {
        this.isDeleted = true;
        this.text = "[Message deleted]";
    }
    
    public boolean hasAttachment() {
        return attachmentUrl != null && !attachmentUrl.isEmpty();
    }
    
    public boolean isThreaded() {
        return parentMessageId != null;
    }
    
    public boolean isSystemMessage() {
        return type == MessageType.SYSTEM;
    }
    
    public boolean isVideoCallMessage() {
        return type == MessageType.VIDEO_CALL_START || type == MessageType.VIDEO_CALL_END;
    }
    
    // Factory methods for special message types
    public static Message createSystemMessage(String roomId, String text) {
        Message message = new Message();
        message.setRoomId(roomId);
        message.setSenderId("system");
        message.setSenderUsername("System");
        message.setText(text);
        message.setType(MessageType.SYSTEM);
        message.setCreatedAt(LocalDateTime.now());
        return message;
    }
    
    public static Message createVideoCallStartMessage(String roomId, String senderId, String senderUsername, String videoCallData) {
        Message message = new Message(roomId, senderId, senderUsername, "Started a video call");
        message.setType(MessageType.VIDEO_CALL_START);
        message.setVideoCallData(videoCallData);
        return message;
    }
    
    public static Message createVideoCallEndMessage(String roomId, String senderId, String senderUsername, String videoCallData) {
        Message message = new Message(roomId, senderId, senderUsername, "Ended the video call");
        message.setType(MessageType.VIDEO_CALL_END);
        message.setVideoCallData(videoCallData);
        return message;
    }
}
