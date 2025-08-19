package com.workspace.app.repository;

import com.workspace.app.model.WorkspaceMember;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for WorkspaceMember entities
 */
@Repository
public interface WorkspaceMemberRepository extends MongoRepository<WorkspaceMember, String> {
    
    /**
     * Find membership by workspace and user
     */
    Optional<WorkspaceMember> findByWorkspaceIdAndUserId(String workspaceId, String userId);
    
    /**
     * Find all members of a workspace
     */
    List<WorkspaceMember> findByWorkspaceId(String workspaceId);
    
    /**
     * Find all active members of a workspace
     */
    List<WorkspaceMember> findByWorkspaceIdAndActiveTrue(String workspaceId);
    
    /**
     * Find all workspaces a user belongs to
     */
    List<WorkspaceMember> findByUserId(String userId);
    
    /**
     * Find all active workspaces a user belongs to
     */
    List<WorkspaceMember> findByUserIdAndActiveTrue(String userId);
    
    /**
     * Find all admins of a workspace
     */
    List<WorkspaceMember> findByWorkspaceIdAndRole(String workspaceId, String role);
    
    /**
     * Check if user is member of workspace
     */
    boolean existsByWorkspaceIdAndUserId(String workspaceId, String userId);
    
    /**
     * Check if user is admin of workspace
     */
    boolean existsByWorkspaceIdAndUserIdAndRole(String workspaceId, String userId, String role);
    
    /**
     * Count members in workspace
     */
    long countByWorkspaceId(String workspaceId);
    
    /**
     * Count active members in workspace
     */
    long countByWorkspaceIdAndActiveTrue(String workspaceId);
}
