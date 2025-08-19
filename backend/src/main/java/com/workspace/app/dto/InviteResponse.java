package com.workspace.app.dto;

import com.workspace.app.model.WorkspaceInvite;
import com.workspace.app.model.Workspace;

import java.time.LocalDateTime;

/**
 * Response DTO for workspace invite information
 */
public class InviteResponse {
    
    private String id;
    private String email;
    private String workspaceId;
    private String workspaceName;
    private String invitedBy;
    private LocalDateTime invitedAt;
    private LocalDateTime expiresAt;
    private boolean used;
    private boolean expired;
    private boolean valid;
    
    // Constructors
    public InviteResponse() {}
    
    public InviteResponse(WorkspaceInvite invite) {
        this.id = invite.getId();
        this.email = invite.getEmail();
        this.workspaceId = invite.getWorkspaceId();
        this.invitedBy = invite.getInvitedBy();
        this.invitedAt = invite.getInvitedAt();
        this.expiresAt = invite.getExpiresAt();
        this.used = invite.isUsed();
        this.expired = invite.isExpired();
        this.valid = invite.isValid();
    }
    
    public InviteResponse(WorkspaceInvite invite, Workspace workspace) {
        this(invite);
        if (workspace != null) {
            this.workspaceName = workspace.getName();
        }
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
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
    
    public String getWorkspaceName() {
        return workspaceName;
    }
    
    public void setWorkspaceName(String workspaceName) {
        this.workspaceName = workspaceName;
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
    
    public boolean isExpired() {
        return expired;
    }
    
    public void setExpired(boolean expired) {
        this.expired = expired;
    }
    
    public boolean isValid() {
        return valid;
    }
    
    public void setValid(boolean valid) {
        this.valid = valid;
    }
}
