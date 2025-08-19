package com.workspace.app.controller;

import com.workspace.app.dto.ApiResponse;
import com.workspace.app.model.User;
import com.workspace.app.service.UserService;
import com.workspace.app.service.WorkspaceService;
import com.workspace.app.service.WorkspaceInviteService;
import com.workspace.app.service.RoomService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * System-only REST Controller for internal operations
 */
@RestController
@RequestMapping("/system")
public class SystemController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private WorkspaceService workspaceService;
    
    @Autowired
    private WorkspaceInviteService workspaceInviteService;
    
    @Autowired
    private RoomService roomService;
    
    private static final String SYSTEM_KEY = "system_admin_key_2024"; // In production, use proper authentication
    
    /**
     * Add specific user directly to an existing workspace (bypasses invite flow)
     * Example: Add samarthdev.io@gmail.com to palsamarth9@gmail.com's workspace
     */
    @PostMapping("/add-to-workspace")
    public ResponseEntity<ApiResponse<String>> addUserToWorkspace(
            @RequestParam String adminEmail,
            @RequestParam String userEmail,
            @RequestParam String systemKey) {
        
        // Basic system key validation (in production, use proper authentication)
        if (!SYSTEM_KEY.equals(systemKey)) {
            return ResponseEntity.status(401).body(
                new ApiResponse<>(false, "Unauthorized system access", null)
            );
        }
        
        try {
            // Find admin user
            Optional<User> adminUserOpt = userService.getUserByEmail(adminEmail);
            if (adminUserOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false, "Admin user not found: " + adminEmail, null)
                );
            }
            
            User adminUser = adminUserOpt.get();
            
            // Get admin's workspace
            if (adminUser.getCurrentWorkspaceId() == null || adminUser.getWorkspaceIds().isEmpty()) {
                return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false, "Admin user has no workspace", null)
                );
            }
            
            String workspaceId = adminUser.getCurrentWorkspaceId();
            if (workspaceId == null) {
                workspaceId = adminUser.getWorkspaceIds().get(0); // Use first workspace
            }
            
            // Find target user
            Optional<User> targetUserOpt = userService.getUserByEmail(userEmail);
            if (targetUserOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false, "Target user not found: " + userEmail, null)
                );
            }
            
            User targetUser = targetUserOpt.get();
            
            // Check if user is already in workspace
            if (workspaceService.isWorkspaceMember(workspaceId, targetUser.getId())) {
                return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false, "User is already a member of this workspace", null)
                );
            }
            
            // Add user to workspace
            workspaceService.addUserToWorkspace(workspaceId, targetUser.getId(), "member");
            
            // Add user to ALL existing rooms in the workspace
            List<String> roomIds = roomService.getAllRoomIdsInWorkspace(workspaceId);
            for (String roomId : roomIds) {
                roomService.addUserToRoom(roomId, targetUser.getId());
            }
            
            return ResponseEntity.ok(
                new ApiResponse<>(true, 
                    "User " + userEmail + " successfully added to " + adminEmail + "'s workspace and all rooms", 
                    "Added to " + roomIds.size() + " rooms")
            );
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                new ApiResponse<>(false, "Error adding user to workspace: " + e.getMessage(), null)
            );
        }
    }
    
    /**
     * Set up default admin and workspace
     */
    @PostMapping("/setup-default-admin")
    public ResponseEntity<ApiResponse<String>> setupDefaultAdmin(
            @RequestParam String adminEmail,
            @RequestParam String systemKey) {
        
        // Basic system key validation
        if (!SYSTEM_KEY.equals(systemKey)) {
            return ResponseEntity.status(401).body(
                new ApiResponse<>(false, "Unauthorized system access", null)
            );
        }
        
        try {
            // Check if admin user exists
            Optional<User> adminUserOpt = userService.getUserByEmail(adminEmail);
            if (adminUserOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false, "Admin user not found. Please register first: " + adminEmail, null)
                );
            }
            
            User adminUser = adminUserOpt.get();
            
            // Check if admin already has a workspace
            if (adminUser.getCurrentWorkspaceId() != null && !adminUser.getWorkspaceIds().isEmpty()) {
                return ResponseEntity.ok(
                    new ApiResponse<>(true, "Admin already has workspace setup", adminUser.getCurrentWorkspaceId())
                );
            }
            
            // Create default workspace for admin
            String workspaceName = "Primary Workspace";
            var workspace = workspaceService.createWorkspace(workspaceName, "Primary workspace for the organization", adminUser.getId());
            
            return ResponseEntity.ok(
                new ApiResponse<>(true, "Default workspace created for admin", workspace.getId())
            );
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                new ApiResponse<>(false, "Error setting up default admin: " + e.getMessage(), null)
            );
        }
    }
    
    /**
     * Reset password for a user (system operation)
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @RequestParam String email,
            @RequestParam String newPassword,
            @RequestParam String systemKey) {
        
        // Basic system key validation
        if (!SYSTEM_KEY.equals(systemKey)) {
            return ResponseEntity.status(401).body(
                new ApiResponse<>(false, "Unauthorized system access", null)
            );
        }
        
        try {
            // Find user by email
            Optional<User> userOpt = userService.getUserByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false, "User not found: " + email, null)
                );
            }
            
            User user = userOpt.get();
            
            // Directly update password hash
            userService.updatePasswordDirectly(user.getId(), newPassword);
            
            return ResponseEntity.ok(
                new ApiResponse<>(true, "Password reset successfully for: " + email, "New password: " + newPassword)
            );
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                new ApiResponse<>(false, "Error resetting password: " + e.getMessage(), null)
            );
        }
    }
}
