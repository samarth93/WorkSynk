package com.workspace.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.CompoundIndex;

import java.time.LocalDateTime;

/**
 * WorkspaceMember Model - Links users to workspaces with roles
 */
@Document(collection = "workspace_members")
@CompoundIndex(def = "{'workspaceId': 1, 'userId': 1}", unique = true)
public class WorkspaceMember {
    
    @Id
    private String id;
    
    @Indexed
    private String workspaceId;
    
    @Indexed
    private String userId;
    
    private String role; // 'admin', 'member'
    
    private LocalDateTime joinedAt;
    
    private boolean active;
    
    // Constructors
    public WorkspaceMember() {
        this.joinedAt = LocalDateTime.now();
        this.active = true;
        this.role = "member"; // Default role
    }
    
    public WorkspaceMember(String workspaceId, String userId, String role) {
        this();
        this.workspaceId = workspaceId;
        this.userId = userId;
        this.role = role;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getWorkspaceId() {
        return workspaceId;
    }
    
    public void setWorkspaceId(String workspaceId) {
        this.workspaceId = workspaceId;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }
    
    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }
    
    public boolean isActive() {
        return active;
    }
    
    public void setActive(boolean active) {
        this.active = active;
    }
    
    // Helper methods
    public boolean isAdmin() {
        return "admin".equalsIgnoreCase(role);
    }
    
    public boolean isMember() {
        return "member".equalsIgnoreCase(role);
    }
}
