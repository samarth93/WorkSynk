package com.workspace.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for sending chat messages
 */
public class MessageRequest {

    @NotBlank(message = "Room ID is required")
    private String roomId;

    @NotBlank(message = "Message text is required")
    @Size(max = 2000, message = "Message cannot exceed 2000 characters")
    private String text;

    private String parentMessageId; // For threaded conversations

    private String type; // "TEXT", "IMAGE", "FILE"
    private String attachmentUrl;
    private String attachmentName;
    private String attachmentType;
    private Long attachmentSize;

    // Constructors
    public MessageRequest() {
    }

    public MessageRequest(String roomId, String text) {
        this.roomId = roomId;
        this.text = text;
    }

    // Getters and Setters
    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getParentMessageId() {
        return parentMessageId;
    }

    public void setParentMessageId(String parentMessageId) {
        this.parentMessageId = parentMessageId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
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

    public Long getAttachmentSize() {
        return attachmentSize;
    }

    public void setAttachmentSize(Long attachmentSize) {
        this.attachmentSize = attachmentSize;
    }
}
