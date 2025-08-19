package com.workspace.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Room Entity for workspace application
 * Represents a chat room/workspace where users can communicate
 */
@Document(collection = "rooms")
public class Room {
    
    @Id
    private String id;
    
    @NotBlank(message = "Room name is required")
    @Size(min = 3, max = 50, message = "Room name must be between 3 and 50 characters")
    private String name;
    
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
    
    @NotBlank(message = "Admin ID is required")
    private String adminId; // User ID of the room creator/admin
    
    private List<String> members = new ArrayList<>(); // User IDs of room members
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    private LocalDateTime lastMessageAt;
    private boolean isActive = true;
    private boolean isPrivate = false; // For future use - private rooms
    
    // Room settings
    private int maxMembers = 100; // Default max members
    private boolean allowFileSharing = true;
    
    // Future video call integration placeholders
    private boolean videoCallEnabled = true;
    private String videoCallRoomId; // For future video SDK integration
    private int maxVideoParticipants = 10;
    
    // VideoSDK integration
    private VideoMeta video;
    
    // Constructors
    public Room() {}
    
    public Room(String name, String description, String adminId) {
        this.name = name;
        this.description = description;
        this.adminId = adminId;
        this.createdAt = LocalDateTime.now();
        this.members.add(adminId); // Admin is automatically a member
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getAdminId() {
        return adminId;
    }
    
    public void setAdminId(String adminId) {
        this.adminId = adminId;
    }
    
    public List<String> getMembers() {
        return members;
    }
    
    public void setMembers(List<String> members) {
        this.members = members;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getLastMessageAt() {
        return lastMessageAt;
    }
    
    public void setLastMessageAt(LocalDateTime lastMessageAt) {
        this.lastMessageAt = lastMessageAt;
    }
    
    public boolean isActive() {
        return isActive;
    }
    
    public void setActive(boolean active) {
        isActive = active;
    }
    
    public boolean isPrivate() {
        return isPrivate;
    }
    
    public void setPrivate(boolean isPrivate) {
        this.isPrivate = isPrivate;
    }
    
    public int getMaxMembers() {
        return maxMembers;
    }
    
    public void setMaxMembers(int maxMembers) {
        this.maxMembers = maxMembers;
    }
    
    public boolean isAllowFileSharing() {
        return allowFileSharing;
    }
    
    public void setAllowFileSharing(boolean allowFileSharing) {
        this.allowFileSharing = allowFileSharing;
    }
    
    public boolean isVideoCallEnabled() {
        return videoCallEnabled;
    }
    
    public void setVideoCallEnabled(boolean videoCallEnabled) {
        this.videoCallEnabled = videoCallEnabled;
    }
    
    public String getVideoCallRoomId() {
        return videoCallRoomId;
    }
    
    public void setVideoCallRoomId(String videoCallRoomId) {
        this.videoCallRoomId = videoCallRoomId;
    }
    
    public int getMaxVideoParticipants() {
        return maxVideoParticipants;
    }
    
    public void setMaxVideoParticipants(int maxVideoParticipants) {
        this.maxVideoParticipants = maxVideoParticipants;
    }
    
    // Helper methods
    public void addMember(String userId) {
        if (!members.contains(userId) && members.size() < maxMembers) {
            members.add(userId);
        }
    }
    
    public void removeMember(String userId) {
        members.remove(userId);
    }
    
    public boolean isMember(String userId) {
        return members.contains(userId);
    }
    
    public boolean isAdmin(String userId) {
        return adminId.equals(userId);
    }
    
    public int getMemberCount() {
        return members.size();
    }
    
    public boolean canAddMember() {
        return members.size() < maxMembers;
    }
    
    // Future video call integration helper methods
    public void initializeVideoCall() {
        // Placeholder for video call SDK initialization
        // This will be implemented when integrating with video call SDK
        this.videoCallRoomId = "vc_" + this.id + "_" + System.currentTimeMillis();
    }
    
    public void endVideoCall() {
        // Placeholder for video call cleanup
        this.videoCallRoomId = null;
    }
    
    public VideoMeta getVideo() {
        return video;
    }
    
    public void setVideo(VideoMeta video) {
        this.video = video;
    }
    
    // VideoMeta inner class
    public static class VideoMeta {
        private String provider;       // "videosdk"
        private String videoRoomId;    // VideoSDK meeting/room id
        private Boolean active;
        private String lastStartedBy;
        private java.time.Instant lastStartedAt;
        
        // Constructors
        public VideoMeta() {}
        
        public VideoMeta(String provider, String videoRoomId) {
            this.provider = provider;
            this.videoRoomId = videoRoomId;
            this.active = true;
            this.lastStartedAt = java.time.Instant.now();
        }
        
        // Getters and Setters
        public String getProvider() {
            return provider;
        }
        
        public void setProvider(String provider) {
            this.provider = provider;
        }
        
        public String getVideoRoomId() {
            return videoRoomId;
        }
        
        public void setVideoRoomId(String videoRoomId) {
            this.videoRoomId = videoRoomId;
        }
        
        public Boolean getActive() {
            return active;
        }
        
        public void setActive(Boolean active) {
            this.active = active;
        }
        
        public String getLastStartedBy() {
            return lastStartedBy;
        }
        
        public void setLastStartedBy(String lastStartedBy) {
            this.lastStartedBy = lastStartedBy;
        }
        
        public java.time.Instant getLastStartedAt() {
            return lastStartedAt;
        }
        
        public void setLastStartedAt(java.time.Instant lastStartedAt) {
            this.lastStartedAt = lastStartedAt;
        }
    }
}
