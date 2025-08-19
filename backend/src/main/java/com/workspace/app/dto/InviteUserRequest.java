package com.workspace.app.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for inviting a user to workspace
 */
public class InviteUserRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email")
    private String email;
    
    private String workspaceId; // Optional - if not provided, use user's current workspace
    
    // Constructors
    public InviteUserRequest() {}
    
    public InviteUserRequest(String email, String workspaceId) {
        this.email = email;
        this.workspaceId = workspaceId;
    }
    
    // Getters and Setters
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getWorkspaceId() {
        return workspaceId;
    }
    
    public void setWorkspaceId(String workspaceId) {
        this.workspaceId = workspaceId;
    }
}
