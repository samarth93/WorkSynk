package com.workspace.app.repository;

import com.workspace.app.model.WorkspaceInvite;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for WorkspaceInvite entities
 */
@Repository
public interface WorkspaceInviteRepository extends MongoRepository<WorkspaceInvite, String> {
    
    /**
     * Find invite by email (case-insensitive)
     */
    Optional<WorkspaceInvite> findByEmailIgnoreCase(String email);
    
    /**
     * Find valid invite by email (not used and not expired)
     */
    Optional<WorkspaceInvite> findByEmailIgnoreCaseAndUsedFalse(String email);
    
    /**
     * Find all invites for a workspace
     */
    List<WorkspaceInvite> findByWorkspaceId(String workspaceId);
    
    /**
     * Find all invites for a workspace ordered by invitedAt
     */
    List<WorkspaceInvite> findByWorkspaceIdOrderByInvitedAtDesc(String workspaceId);
    
    /**
     * Find all invites sent by a specific admin
     */
    List<WorkspaceInvite> findByInvitedBy(String invitedBy);
    
    /**
     * Check if email is already invited to a workspace
     */
    boolean existsByWorkspaceIdAndEmailIgnoreCase(String workspaceId, String email);
    
    /**
     * Find all unused invites for a workspace
     */
    List<WorkspaceInvite> findByWorkspaceIdAndUsedFalse(String workspaceId);
    
    /**
     * Delete expired invites (helper for cleanup)
     */
    void deleteByUsedTrueOrExpiresAtBefore(java.time.LocalDateTime dateTime);
}
