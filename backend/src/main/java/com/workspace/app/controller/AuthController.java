package com.workspace.app.controller;

import com.workspace.app.dto.ApiResponse;
import com.workspace.app.dto.AuthResponse;
import com.workspace.app.dto.LoginRequest;
import com.workspace.app.dto.RegisterRequest;
import com.workspace.app.dto.VerifyInviteRequest;
import com.workspace.app.dto.InviteResponse;
import com.workspace.app.model.WorkspaceInvite;
import com.workspace.app.model.Workspace;
import com.workspace.app.service.UserService;
import com.workspace.app.service.WorkspaceInviteService;
import com.workspace.app.service.WorkspaceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * REST Controller for authentication endpoints
 * Handles user registration, login, and authentication-related operations
 */
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private WorkspaceInviteService workspaceInviteService;
    
    @Autowired
    private WorkspaceService workspaceService;
    
    /**
     * Register a new user
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> registerUser(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse authResponse = userService.registerUser(request);
            
            return ResponseEntity.ok(
                ApiResponse.success("User registered successfully", authResponse)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error(e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Registration failed: " + e.getMessage())
            );
        }
    }
    
    /**
     * Authenticate user login
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> loginUser(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse authResponse = userService.loginUser(request);
            
            return ResponseEntity.ok(
                ApiResponse.success("Login successful", authResponse)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error(e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Login failed: " + e.getMessage())
            );
        }
    }
    
    /**
     * Validate JWT token
     * GET /api/auth/validate
     */
    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<Boolean>> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                boolean isValid = userService.validateTokenAndGetUser(token).isPresent();
                
                return ResponseEntity.ok(
                    ApiResponse.success("Token validation result", isValid)
                );
            }
            
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Invalid authorization header")
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Token validation failed: " + e.getMessage())
            );
        }
    }
    
    /**
     * Logout user (client-side token removal)
     * POST /api/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logoutUser() {
        // In JWT-based auth, logout is typically handled client-side by removing the token
        // This endpoint is provided for consistency and future server-side logout features
        return ResponseEntity.ok(
            ApiResponse.success("Logout successful. Please remove the token from client storage.")
        );
    }
    
    /**
     * Check if email is available
     * GET /api/auth/check-email?email=test@example.com
     */
    @GetMapping("/check-email")
    public ResponseEntity<ApiResponse<Boolean>> checkEmailAvailability(@RequestParam String email) {
        try {
            boolean isAvailable = userService.getUserByEmail(email).isEmpty();
            
            return ResponseEntity.ok(
                ApiResponse.success("Email availability check", isAvailable)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Email check failed: " + e.getMessage())
            );
        }
    }
    
    /**
     * Check if username is available
     * GET /api/auth/check-username?username=testuser
     */
    @GetMapping("/check-username")
    public ResponseEntity<ApiResponse<Boolean>> checkUsernameAvailability(@RequestParam String username) {
        try {
            boolean isAvailable = userService.getUserByUsername(username).isEmpty();
            
            return ResponseEntity.ok(
                ApiResponse.success("Username availability check", isAvailable)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Username check failed: " + e.getMessage())
            );
        }
    }
    
    /**
     * Verify workspace invite by email
     * POST /api/auth/join-workspace
     */
    @PostMapping("/join-workspace")
    public ResponseEntity<ApiResponse<InviteResponse>> verifyWorkspaceInvite(@Valid @RequestBody VerifyInviteRequest request) {
        try {
            Optional<WorkspaceInvite> inviteOpt = workspaceInviteService.verifyEmailInvite(request.getEmail());
            
            if (inviteOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.error("You are not invited to join this workspace or the invite has expired.")
                );
            }
            
            WorkspaceInvite invite = inviteOpt.get();
            
            // Get workspace information
            Optional<Workspace> workspaceOpt = workspaceService.getWorkspaceById(invite.getWorkspaceId());
            InviteResponse response = workspaceOpt.isPresent() 
                ? new InviteResponse(invite, workspaceOpt.get())
                : new InviteResponse(invite);
            
            return ResponseEntity.ok(
                ApiResponse.success("Valid workspace invite found", response)
            );
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to verify workspace invite: " + e.getMessage())
            );
        }
    }
    
    /**
     * Health check endpoint
     * GET /api/auth/health
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        return ResponseEntity.ok(
            ApiResponse.success("Authentication service is running")
        );
    }
}
