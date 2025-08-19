package com.workspace.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for room creation requests
 */
public class CreateRoomRequest {
    
    @NotBlank(message = "Room name is required")
    @Size(min = 3, max = 50, message = "Room name must be between 3 and 50 characters")
    private String name;
    
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
    
    private boolean isPrivate = false;
    private int maxMembers = 100;
    
    // Future video call settings
    private boolean videoCallEnabled = true;
    private int maxVideoParticipants = 10;
    
    // Constructors
    public CreateRoomRequest() {}
    
    public CreateRoomRequest(String name, String description) {
        this.name = name;
        this.description = description;
    }
    
    // Getters and Setters
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
    
    public boolean isVideoCallEnabled() {
        return videoCallEnabled;
    }
    
    public void setVideoCallEnabled(boolean videoCallEnabled) {
        this.videoCallEnabled = videoCallEnabled;
    }
    
    public int getMaxVideoParticipants() {
        return maxVideoParticipants;
    }
    
    public void setMaxVideoParticipants(int maxVideoParticipants) {
        this.maxVideoParticipants = maxVideoParticipants;
    }
}
