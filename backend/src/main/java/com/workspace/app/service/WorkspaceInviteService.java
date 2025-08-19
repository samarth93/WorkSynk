package com.workspace.app.service;

import com.workspace.app.model.WorkspaceInvite;
import com.workspace.app.model.User;
import com.workspace.app.repository.WorkspaceInviteRepository;
import com.workspace.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service for managing workspace invitations
 */
@Service
public class WorkspaceInviteService {
    
    @Autowired
    private WorkspaceInviteRepository workspaceInviteRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private WorkspaceService workspaceService;
    
    @Autowired
    private RoomService roomService;
    
    /**
     * Create a new workspace invite
     */
    public WorkspaceInvite createInvite(String workspaceId, String email, String invitedBy) {
        // Validate that inviter is admin of the workspace
        if (!workspaceService.isWorkspaceAdmin(workspaceId, invitedBy)) {
            throw new RuntimeException("Only workspace admins can send invites");
        }
        
        // Check if email is already invited to this workspace
        if (workspaceInviteRepository.existsByWorkspaceIdAndEmailIgnoreCase(workspaceId, email)) {
            throw new RuntimeException("Email is already invited to this workspace");
        }
        
        // Check if user with this email already exists and is member of workspace
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent() && workspaceService.isWorkspaceMember(workspaceId, existingUser.get().getId())) {
            throw new RuntimeException("User is already a member of this workspace");
        }
        
        // Create invite
        WorkspaceInvite invite = new WorkspaceInvite(workspaceId, email, invitedBy);
        return workspaceInviteRepository.save(invite);
    }
    
    /**
     * Get all invites for a workspace
     */
    public List<WorkspaceInvite> getWorkspaceInvites(String workspaceId, String requesterId) {
        // Validate that requester is admin of the workspace
        if (!workspaceService.isWorkspaceAdmin(workspaceId, requesterId)) {
            throw new RuntimeException("Only workspace admins can view invites");
        }
        
        return workspaceInviteRepository.findByWorkspaceIdOrderByInvitedAtDesc(workspaceId);
    }
    
    /**
     * Verify email invite and return invite details
     */
    public Optional<WorkspaceInvite> verifyEmailInvite(String email) {
        return workspaceInviteRepository.findByEmailIgnoreCaseAndUsedFalse(email)
                .filter(WorkspaceInvite::isValid);
    }
    
    /**
     * Find pending invite by email (NEW METHOD FOR REGISTRATION FLOW)
     */
    public Optional<WorkspaceInvite> findPendingInviteByEmail(String email) {
        return workspaceInviteRepository.findByEmailIgnoreCaseAndUsedFalse(email)
                .filter(invite -> invite.isValid() && "pending".equals(invite.getStatus()));
    }
    
    /**
     * Mark invite as used
     */
    public void markInviteAsUsed(String inviteId) {
        Optional<WorkspaceInvite> inviteOpt = workspaceInviteRepository.findById(inviteId);
        if (inviteOpt.isPresent()) {
            WorkspaceInvite invite = inviteOpt.get();
            invite.markAsUsed();
            workspaceInviteRepository.save(invite);
        }
    }
    
    /**
     * Process invite acceptance - add user to workspace and ALL existing rooms
     */
    public void acceptInvite(WorkspaceInvite invite, String userId) {
        // Mark invite as used
        invite.markAsUsed();
        workspaceInviteRepository.save(invite);
        
        // Add user to workspace
        workspaceService.addUserToWorkspace(invite.getWorkspaceId(), userId, "member");
        
        // ✅ CRITICAL: Add user to ALL rooms in the workspace
        try {
            List<String> roomIds = roomService.getAllRoomIdsInWorkspace(invite.getWorkspaceId());
            for (String roomId : roomIds) {
                roomService.addUserToRoom(roomId, userId);
            }
        } catch (Exception e) {
            System.err.println("⚠️ Could not add user to all rooms: " + e.getMessage());
        }
    }
    
    /**
     * Cancel/delete an invite
     */
    public void cancelInvite(String inviteId, String requesterId) {
        Optional<WorkspaceInvite> inviteOpt = workspaceInviteRepository.findById(inviteId);
        if (inviteOpt.isEmpty()) {
            throw new RuntimeException("Invite not found");
        }
        
        WorkspaceInvite invite = inviteOpt.get();
        
        // Validate that requester is admin of the workspace
        if (!workspaceService.isWorkspaceAdmin(invite.getWorkspaceId(), requesterId)) {
            throw new RuntimeException("Only workspace admins can cancel invites");
        }
        
        workspaceInviteRepository.delete(invite);
    }
    
    /**
     * Get pending invites count for workspace
     */
    public long getPendingInvitesCount(String workspaceId) {
        return workspaceInviteRepository.findByWorkspaceIdAndUsedFalse(workspaceId).size();
    }
    
    /**
     * Clean up expired invites
     */
    public void cleanupExpiredInvites() {
        workspaceInviteRepository.deleteByUsedTrueOrExpiresAtBefore(LocalDateTime.now());
    }
    
    /**
     * Resend invite (create new invite for same email, mark old as used)
     */
    public WorkspaceInvite resendInvite(String inviteId, String requesterId) {
        Optional<WorkspaceInvite> inviteOpt = workspaceInviteRepository.findById(inviteId);
        if (inviteOpt.isEmpty()) {
            throw new RuntimeException("Invite not found");
        }
        
        WorkspaceInvite oldInvite = inviteOpt.get();
        
        // Validate that requester is admin of the workspace
        if (!workspaceService.isWorkspaceAdmin(oldInvite.getWorkspaceId(), requesterId)) {
            throw new RuntimeException("Only workspace admins can resend invites");
        }
        
        // Mark old invite as used
        oldInvite.markAsUsed();
        workspaceInviteRepository.save(oldInvite);
        
        // Create new invite
        return createInvite(oldInvite.getWorkspaceId(), oldInvite.getEmail(), requesterId);
    }
}
