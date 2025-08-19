package com.workspace.app.repository;

import com.workspace.app.model.Workspace;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Workspace entities
 */
@Repository
public interface WorkspaceRepository extends MongoRepository<Workspace, String> {
    
    /**
     * Find workspace by admin ID
     */
    List<Workspace> findByAdminId(String adminId);
    
    /**
     * Find active workspaces by admin ID
     */
    List<Workspace> findByAdminIdAndActiveTrue(String adminId);
    
    /**
     * Find workspace by name (case-insensitive)
     */
    Optional<Workspace> findByNameIgnoreCase(String name);
    
    /**
     * Find workspace by invite code
     */
    Optional<Workspace> findByInviteCode(String inviteCode);
    
    /**
     * Find all active workspaces
     */
    List<Workspace> findByActiveTrue();
    
    /**
     * Check if workspace name exists
     */
    boolean existsByNameIgnoreCase(String name);
    
    /**
     * Check if invite code exists
     */
    boolean existsByInviteCode(String inviteCode);
}
