package com.workspace.app.service;

import com.workspace.app.model.Workspace;
import com.workspace.app.model.WorkspaceMember;
import com.workspace.app.model.User;
import com.workspace.app.repository.WorkspaceRepository;
import com.workspace.app.repository.WorkspaceMemberRepository;
import com.workspace.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for managing workspaces
 */
@Service
public class WorkspaceService {
    
    @Autowired
    private WorkspaceRepository workspaceRepository;
    
    @Autowired
    private WorkspaceMemberRepository workspaceMemberRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Create a new workspace
     */
    public Workspace createWorkspace(String name, String description, String adminId) {
        // Check if workspace name already exists
        if (workspaceRepository.existsByNameIgnoreCase(name)) {
            throw new RuntimeException("Workspace name already exists");
        }
        
        // Create workspace
        Workspace workspace = new Workspace(name, description, adminId);
        workspace.setInviteCode(generateUniqueInviteCode());
        workspace = workspaceRepository.save(workspace);
        
        // Add admin as workspace member
        WorkspaceMember adminMember = new WorkspaceMember(workspace.getId(), adminId, "admin");
        workspaceMemberRepository.save(adminMember);
        
        // Update user's workspace list
        Optional<User> userOpt = userRepository.findById(adminId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.addWorkspace(workspace.getId());
            userRepository.save(user);
        }
        
        return workspace;
    }
    
    /**
     * Get workspace by ID
     */
    public Optional<Workspace> getWorkspaceById(String workspaceId) {
        return workspaceRepository.findById(workspaceId);
    }
    
    /**
     * Get all workspaces for a user
     */
    public List<Workspace> getUserWorkspaces(String userId) {
        List<WorkspaceMember> memberships = workspaceMemberRepository.findByUserIdAndActiveTrue(userId);
        return memberships.stream()
                .map(member -> workspaceRepository.findById(member.getWorkspaceId()))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .toList();
    }
    
    /**
     * Get workspaces where user is admin
     */
    public List<Workspace> getAdminWorkspaces(String userId) {
        return workspaceRepository.findByAdminIdAndActiveTrue(userId);
    }
    
    /**
     * Check if user is admin of workspace
     */
    public boolean isWorkspaceAdmin(String workspaceId, String userId) {
        return workspaceMemberRepository.existsByWorkspaceIdAndUserIdAndRole(workspaceId, userId, "admin");
    }
    
    /**
     * Check if user is member of workspace
     */
    public boolean isWorkspaceMember(String workspaceId, String userId) {
        return workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, userId);
    }
    
    /**
     * Add user to workspace
     */
    public WorkspaceMember addUserToWorkspace(String workspaceId, String userId, String role) {
        // Check if user is already a member
        if (workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, userId)) {
            throw new RuntimeException("User is already a member of this workspace");
        }
        
        // Create membership
        WorkspaceMember member = new WorkspaceMember(workspaceId, userId, role);
        member = workspaceMemberRepository.save(member);
        
        // Update user's workspace list
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.addWorkspace(workspaceId);
            userRepository.save(user);
        }
        
        return member;
    }
    
    /**
     * Remove user from workspace
     */
    public void removeUserFromWorkspace(String workspaceId, String userId) {
        Optional<WorkspaceMember> memberOpt = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId);
        if (memberOpt.isPresent()) {
            WorkspaceMember member = memberOpt.get();
            member.setActive(false);
            workspaceMemberRepository.save(member);
            
            // Update user's workspace list
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.removeWorkspace(workspaceId);
                userRepository.save(user);
            }
        }
    }
    
    /**
     * Get all members of a workspace
     */
    public List<WorkspaceMember> getWorkspaceMembers(String workspaceId) {
        return workspaceMemberRepository.findByWorkspaceIdAndActiveTrue(workspaceId);
    }
    
    /**
     * Get member count for workspace
     */
    public long getWorkspaceMemberCount(String workspaceId) {
        return workspaceMemberRepository.countByWorkspaceIdAndActiveTrue(workspaceId);
    }
    
    /**
     * Generate unique invite code
     */
    private String generateUniqueInviteCode() {
        String code;
        do {
            code = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (workspaceRepository.existsByInviteCode(code));
        return code;
    }
    
    /**
     * Find workspace by invite code
     */
    public Optional<Workspace> findByInviteCode(String inviteCode) {
        return workspaceRepository.findByInviteCode(inviteCode);
    }
    
    /**
     * Set up default workspace for system admin
     */
    public Workspace setupDefaultWorkspace(String adminEmail) {
        // Check if default workspace already exists
        Optional<Workspace> existingWorkspace = workspaceRepository.findByNameIgnoreCase("Default Workspace");
        if (existingWorkspace.isPresent()) {
            return existingWorkspace.get();
        }
        
        // Find admin user
        Optional<User> adminUserOpt = userRepository.findByEmail(adminEmail);
        if (adminUserOpt.isEmpty()) {
            throw new RuntimeException("Admin user not found: " + adminEmail);
        }
        
        User adminUser = adminUserOpt.get();
        
        // Create default workspace
        return createWorkspace("Default Workspace", "Default workspace for the organization", adminUser.getId());
    }
}
