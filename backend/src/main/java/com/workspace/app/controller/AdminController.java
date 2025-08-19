package com.workspace.app.controller;

import com.workspace.app.dto.ApiResponse;
import com.workspace.app.dto.InviteUserRequest;
import com.workspace.app.dto.InviteResponse;
import com.workspace.app.model.WorkspaceInvite;
import com.workspace.app.model.Workspace;
import com.workspace.app.model.User;
import com.workspace.app.service.WorkspaceInviteService;
import com.workspace.app.service.WorkspaceService;
import com.workspace.app.service.UserService;
import com.workspace.app.security.JwtUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;

/**
 * REST Controller for admin-only workspace management operations
 */
@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('USER')")
public class AdminController {
    
    @Autowired
    private WorkspaceInviteService workspaceInviteService;
    
    @Autowired
    private WorkspaceService workspaceService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    /**
     * Send workspace invite to email
     */
    @PostMapping("/invite")
    public ResponseEntity<ApiResponse<InviteResponse>> inviteUser(
            @Valid @RequestBody InviteUserRequest request,
            HttpServletRequest httpRequest) {
        
        try {
            // Get current user from JWT token
            String token = parseJwt(httpRequest);
            if (token == null) {
                return ResponseEntity.status(401).body(
                    new ApiResponse<>(false, "No authentication token provided", null)
                );
            }
            String currentUserId = jwtUtils.getUserIdFromJwtToken(token);
            
            // Get user's current workspace if not specified
            String workspaceId = request.getWorkspaceId();
            if (workspaceId == null || workspaceId.isEmpty()) {
                Optional<User> userOpt = userService.getUserById(currentUserId);
                if (userOpt.isEmpty() || userOpt.get().getCurrentWorkspaceId() == null) {
                    return ResponseEntity.badRequest().body(
                        new ApiResponse<>(false, "No active workspace found", null)
                    );
                }
                workspaceId = userOpt.get().getCurrentWorkspaceId();
            }
            
            // Verify user is admin of the workspace
            if (!workspaceService.isWorkspaceAdmin(workspaceId, currentUserId)) {
                return ResponseEntity.status(403).body(
                    new ApiResponse<>(false, "Only workspace admins can send invites", null)
                );
            }
            
            // Create invite
            WorkspaceInvite invite = workspaceInviteService.createInvite(
                workspaceId, 
                request.getEmail(), 
                currentUserId
            );
            
            // Get workspace info for response
            Optional<Workspace> workspaceOpt = workspaceService.getWorkspaceById(workspaceId);
            InviteResponse response = workspaceOpt.isPresent() 
                ? new InviteResponse(invite, workspaceOpt.get())
                : new InviteResponse(invite);
            
            return ResponseEntity.ok(
                new ApiResponse<>(true, "Invite sent successfully", response)
            );
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                new ApiResponse<>(false, e.getMessage(), null)
            );
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                new ApiResponse<>(false, "Failed to send invite", null)
            );
        }
    }
    
    /**
     * Get all invites for current user's workspace
     */
    @GetMapping("/invites")
    public ResponseEntity<ApiResponse<List<InviteResponse>>> getWorkspaceInvites(
            @RequestParam(required = false) String workspaceId,
            HttpServletRequest httpRequest) {
        
        try {
            // Get current user from JWT token
            String token = parseJwt(httpRequest);
            if (token == null) {
                return ResponseEntity.status(401).body(
                    new ApiResponse<>(false, "No authentication token provided", null)
                );
            }
            String currentUserId = jwtUtils.getUserIdFromJwtToken(token);
            
            // Get user's current workspace if not specified
            if (workspaceId == null || workspaceId.isEmpty()) {
                Optional<User> userOpt = userService.getUserById(currentUserId);
                if (userOpt.isEmpty() || userOpt.get().getCurrentWorkspaceId() == null) {
                    return ResponseEntity.badRequest().body(
                        new ApiResponse<>(false, "No active workspace found", null)
                    );
                }
                workspaceId = userOpt.get().getCurrentWorkspaceId();
            }
            
            // Verify user is admin of the workspace
            if (!workspaceService.isWorkspaceAdmin(workspaceId, currentUserId)) {
                return ResponseEntity.status(403).body(
                    new ApiResponse<>(false, "Only workspace admins can view invites", null)
                );
            }
            
            // Get invites
            List<WorkspaceInvite> invites = workspaceInviteService.getWorkspaceInvites(workspaceId, currentUserId);
            
            // Get workspace info
            Optional<Workspace> workspaceOpt = workspaceService.getWorkspaceById(workspaceId);
            
            // Convert to response DTOs
            List<InviteResponse> responses = invites.stream()
                .map(invite -> workspaceOpt.isPresent() 
                    ? new InviteResponse(invite, workspaceOpt.get())
                    : new InviteResponse(invite))
                .toList();
            
            return ResponseEntity.ok(
                new ApiResponse<>(true, "Invites retrieved successfully", responses)
            );
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                new ApiResponse<>(false, e.getMessage(), null)
            );
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                new ApiResponse<>(false, "Failed to retrieve invites", null)
            );
        }
    }
    
    /**
     * Cancel/delete an invite
     */
    @DeleteMapping("/invites/{inviteId}")
    public ResponseEntity<ApiResponse<String>> cancelInvite(
            @PathVariable String inviteId,
            HttpServletRequest httpRequest) {
        
        try {
            // Get current user from JWT token
            String token = parseJwt(httpRequest);
            if (token == null) {
                return ResponseEntity.status(401).body(
                    new ApiResponse<>(false, "No authentication token provided", null)
                );
            }
            String currentUserId = jwtUtils.getUserIdFromJwtToken(token);
            
            // Cancel invite
            workspaceInviteService.cancelInvite(inviteId, currentUserId);
            
            return ResponseEntity.ok(
                new ApiResponse<>(true, "Invite cancelled successfully", null)
            );
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                new ApiResponse<>(false, e.getMessage(), null)
            );
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                new ApiResponse<>(false, "Failed to cancel invite", null)
            );
        }
    }
    
    /**
     * Resend an invite
     */
    @PostMapping("/invites/{inviteId}/resend")
    public ResponseEntity<ApiResponse<InviteResponse>> resendInvite(
            @PathVariable String inviteId,
            HttpServletRequest httpRequest) {
        
        try {
            // Get current user from JWT token
            String token = parseJwt(httpRequest);
            if (token == null) {
                return ResponseEntity.status(401).body(
                    new ApiResponse<>(false, "No authentication token provided", null)
                );
            }
            String currentUserId = jwtUtils.getUserIdFromJwtToken(token);
            
            // Resend invite
            WorkspaceInvite newInvite = workspaceInviteService.resendInvite(inviteId, currentUserId);
            
            // Get workspace info for response
            Optional<Workspace> workspaceOpt = workspaceService.getWorkspaceById(newInvite.getWorkspaceId());
            InviteResponse response = workspaceOpt.isPresent() 
                ? new InviteResponse(newInvite, workspaceOpt.get())
                : new InviteResponse(newInvite);
            
            return ResponseEntity.ok(
                new ApiResponse<>(true, "Invite resent successfully", response)
            );
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                new ApiResponse<>(false, e.getMessage(), null)
            );
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                new ApiResponse<>(false, "Failed to resend invite", null)
            );
        }
    }
    
    /**
     * Extract JWT token from request header
     */
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        
        return null;
    }
}
