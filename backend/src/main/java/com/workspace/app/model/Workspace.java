package com.workspace.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

/**
 * Workspace Model - Represents a workspace/organization
 */
@Document(collection = "workspaces")
public class Workspace {
    
    @Id
    private String id;
    
    @Indexed
    private String name;
    
    private String description;
    
    @Indexed
    private String adminId; // Primary admin/creator of the workspace
    
    private LocalDateTime createdAt;
    
    private boolean active;
    
    private String inviteCode; // Optional: for easy joining
    
    private List<String> settings; // Workspace-specific settings
    
    // Constructors
    public Workspace() {
        this.createdAt = LocalDateTime.now();
        this.active = true;
        this.settings = new ArrayList<>();
    }
    
    public Workspace(String name, String description, String adminId) {
        this();
        this.name = name;
        this.description = description;
        this.adminId = adminId;
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
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public boolean isActive() {
        return active;
    }
    
    public void setActive(boolean active) {
        this.active = active;
    }
    
    public String getInviteCode() {
        return inviteCode;
    }
    
    public void setInviteCode(String inviteCode) {
        this.inviteCode = inviteCode;
    }
    
    public List<String> getSettings() {
        return settings;
    }
    
    public void setSettings(List<String> settings) {
        this.settings = settings;
    }
}
