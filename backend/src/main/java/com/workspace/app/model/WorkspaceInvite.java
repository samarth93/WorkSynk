package com.workspace.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

/**
 * WorkspaceInvite Model - Stores email invitations to join workspace
 */
@Document(collection = "workspace_invites")
public class WorkspaceInvite {
    
    @Id
    private String id;
    
    @Indexed
    private String workspaceId;
    
    @Indexed
    private String email;
    
    private String invitedBy; // Admin ID who sent the invite
    
    private LocalDateTime invitedAt;
    
    private LocalDateTime expiresAt;
    
    private boolean used; // Whether the invite has been used
    
    private String status; // "pending", "accepted", "expired", "cancelled"
    
    private LocalDateTime usedAt;
    
    // Constructors
    public WorkspaceInvite() {
        this.invitedAt = LocalDateTime.now();
        this.expiresAt = LocalDateTime.now().plusDays(7); // Invites expire in 7 days
        this.used = false;
        this.status = "pending";
    }
    
    public WorkspaceInvite(String workspaceId, String email, String invitedBy) {
        this();
        this.workspaceId = workspaceId;
        this.email = email.toLowerCase().trim();
        this.invitedBy = invitedBy;
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
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email.toLowerCase().trim();
    }
    
    public String getInvitedBy() {
        return invitedBy;
    }
    
    public void setInvitedBy(String invitedBy) {
        this.invitedBy = invitedBy;
    }
    
    public LocalDateTime getInvitedAt() {
        return invitedAt;
    }
    
    public void setInvitedAt(LocalDateTime invitedAt) {
        this.invitedAt = invitedAt;
    }
    
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
    
    public boolean isUsed() {
        return used;
    }
    
    public void setUsed(boolean used) {
        this.used = used;
    }
    
    public LocalDateTime getUsedAt() {
        return usedAt;
    }
    
    public void setUsedAt(LocalDateTime usedAt) {
        this.usedAt = usedAt;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    // Helper methods
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
    
    public boolean isValid() {
        return !used && !isExpired() && "pending".equals(status);
    }
    
    public void markAsUsed() {
        this.used = true;
        this.usedAt = LocalDateTime.now();
        this.status = "accepted";
    }
    
    public void markAsExpired() {
        this.status = "expired";
    }
    
    public void markAsCancelled() {
        this.status = "cancelled";
    }
    
    public boolean isPending() {
        return "pending".equals(status);
    }
}
