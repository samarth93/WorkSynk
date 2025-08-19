package com.workspace.app.service;

import com.workspace.app.dto.AuthResponse;
import com.workspace.app.dto.LoginRequest;
import com.workspace.app.dto.RegisterRequest;
import com.workspace.app.model.User;
import com.workspace.app.model.WorkspaceInvite;
import com.workspace.app.repository.UserRepository;
import com.workspace.app.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for user management and authentication
 */
@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @Autowired
    @Lazy
    private WorkspaceInviteService workspaceInviteService;
    
    @Autowired
    @Lazy
    private WorkspaceService workspaceService;
    
    /**
     * Register a new user - UPDATED LOGIC FOR WORKSPACE INVITE FLOW
     */
    public AuthResponse registerUser(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }
        
        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }
        
        // ✅ CRITICAL: Check if email exists in workspace invites with status "pending"
        Optional<WorkspaceInvite> pendingInvite = workspaceInviteService.findPendingInviteByEmail(request.getEmail());
        
        if (pendingInvite.isPresent()) {
            // ✅ Flow B: Join existing workspace
            return registerUserWithInvite(request, pendingInvite.get());
        } else {
            // ✅ Flow A: Create new workspace
            return registerUserAsNewWorkspaceAdmin(request);
        }
    }
    
    /**
     * Register user and create new workspace (Flow A)
     */
    private AuthResponse registerUserAsNewWorkspaceAdmin(RegisterRequest request) {
        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setCreatedAt(LocalDateTime.now());
        user.setActive(true);
        
        // Save user
        User savedUser = userRepository.save(user);
        
        // ✅ Create new workspace for this user (they become admin)
        try {
            String workspaceName = (request.getFirstName() != null ? request.getFirstName() : request.getUsername()) + "'s Workspace";
            workspaceService.createWorkspace(workspaceName, "Personal workspace", savedUser.getId());
        } catch (Exception e) {
            System.err.println("⚠️ Could not create workspace for new user: " + e.getMessage());
        }
        
        // Generate JWT token
        String token = jwtUtils.generateJwtToken(
            savedUser.getId(), 
            savedUser.getUsername(), 
            savedUser.getEmail()
        );
        
        return createAuthResponse(token, savedUser);
    }
    
    /**
     * Register a new user with workspace invite (Flow B)
     */
    private AuthResponse registerUserWithInvite(RegisterRequest request, WorkspaceInvite invite) {
        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setCreatedAt(LocalDateTime.now());
        user.setActive(true);
        
        // Save user
        User savedUser = userRepository.save(user);
        
        // ✅ Accept the invite (adds user to existing workspace and all rooms)
        try {
            workspaceInviteService.acceptInvite(invite, savedUser.getId());
        } catch (Exception e) {
            System.err.println("⚠️ Could not accept workspace invite: " + e.getMessage());
        }
        
        // Generate JWT token
        String token = jwtUtils.generateJwtToken(
            savedUser.getId(), 
            savedUser.getUsername(), 
            savedUser.getEmail()
        );
        
        return createAuthResponse(token, savedUser);
    }
    
    /**
     * Helper method to create AuthResponse
     */
    private AuthResponse createAuthResponse(String token, User user) {
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        return response;
    }
    
    /**
     * Register a new user with workspace invite (Legacy method for compatibility)
     */
    public AuthResponse registerUserWithInvite(RegisterRequest request, String inviteId) {
        // Verify the invite exists and is valid
        Optional<WorkspaceInvite> inviteOpt = workspaceInviteService.verifyEmailInvite(request.getEmail());
        if (inviteOpt.isEmpty()) {
            throw new RuntimeException("Invalid or expired workspace invite");
        }
        
        WorkspaceInvite invite = inviteOpt.get();
        return registerUserWithInvite(request, invite);
    }
    
    /**
     * Authenticate user login
     */
    public AuthResponse loginUser(LoginRequest request) {
        // Find user by email or username
        Optional<User> userOptional = userRepository.findByEmailOrUsername(request.getEmailOrUsername());
        
        if (userOptional.isEmpty()) {
            throw new RuntimeException("Invalid credentials!");
        }
        
        User user = userOptional.get();
        
        // Check if user is active
        if (!user.isActive()) {
            throw new RuntimeException("Account is deactivated!");
        }
        
        // Validate password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials!");
        }
        
        // Update last login time
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        
        // Generate JWT token
        String token = jwtUtils.generateJwtToken(
            user.getId(), 
            user.getUsername(), 
            user.getEmail()
        );
        
        // Create response
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        
        return response;
    }
    
    /**
     * Get user by ID
     */
    public Optional<User> getUserById(String userId) {
        return userRepository.findById(userId);
    }
    
    /**
     * Get user by username
     */
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    /**
     * Get user by email
     */
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    /**
     * Update user profile
     */
    public User updateUserProfile(String userId, User updatedUser) {
        Optional<User> userOptional = userRepository.findById(userId);
        
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found!");
        }
        
        User user = userOptional.get();
        
        // Update allowed fields
        if (updatedUser.getFirstName() != null) {
            user.setFirstName(updatedUser.getFirstName());
        }
        if (updatedUser.getLastName() != null) {
            user.setLastName(updatedUser.getLastName());
        }
        if (updatedUser.getProfilePictureUrl() != null) {
            user.setProfilePictureUrl(updatedUser.getProfilePictureUrl());
        }
        if (updatedUser.getDesignation() != null) {
            user.setDesignation(updatedUser.getDesignation());
        }
        if (updatedUser.getRole() != null) {
            user.setRole(updatedUser.getRole());
        }
        if (updatedUser.getBio() != null) {
            user.setBio(updatedUser.getBio());
        }
        if (updatedUser.getStatus() != null) {
            user.setStatus(updatedUser.getStatus());
        }
        if (updatedUser.getVideoCallUserPreferences() != null) {
            user.setVideoCallUserPreferences(updatedUser.getVideoCallUserPreferences());
        }
        
        user.setVideoCallEnabled(updatedUser.isVideoCallEnabled());
        
        return userRepository.save(user);
    }
    
    /**
     * Change user password
     */
    public void changePassword(String userId, String currentPassword, String newPassword) {
        Optional<User> userOptional = userRepository.findById(userId);
        
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found!");
        }
        
        User user = userOptional.get();
        
        // Validate current password
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect!");
        }
        
        // Update password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
    
    /**
     * Update password directly (system operation - no validation)
     */
    public void updatePasswordDirectly(String userId, String newPassword) {
        Optional<User> userOptional = userRepository.findById(userId);
        
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found!");
        }
        
        User user = userOptional.get();
        
        // Update password directly (system operation)
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
    
    /**
     * Deactivate user account
     */
    public void deactivateUser(String userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found!");
        }
        
        User user = userOptional.get();
        user.setActive(false);
        userRepository.save(user);
    }
    
    /**
     * Search users by username
     */
    public List<User> searchUsers(String username) {
        return userRepository.findByUsernameContainingIgnoreCaseAndIsActiveTrue(username);
    }
    
    /**
     * Get all active users
     */
    public List<User> getAllActiveUsers() {
        return userRepository.findByIsActiveTrue();
    }
    
    /**
     * Add user to room
     */
    public void addUserToRoom(String userId, String roomId) {
        Optional<User> userOptional = userRepository.findById(userId);
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.addJoinedRoom(roomId);
            userRepository.save(user);
        }
    }
    
    /**
     * Remove user from room
     */
    public void removeUserFromRoom(String userId, String roomId) {
        Optional<User> userOptional = userRepository.findById(userId);
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.removeJoinedRoom(roomId);
            userRepository.save(user);
        }
    }
    
    /**
     * Make user admin of room
     */
    public void makeUserAdminOfRoom(String userId, String roomId) {
        Optional<User> userOptional = userRepository.findById(userId);
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.addAdminRoom(roomId);
            userRepository.save(user);
        }
    }
    
    /**
     * Remove user as admin of room
     */
    public void removeUserAsAdminOfRoom(String userId, String roomId) {
        Optional<User> userOptional = userRepository.findById(userId);
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.removeAdminRoom(roomId);
            userRepository.save(user);
        }
    }
    
    /**
     * Check if user exists
     */
    public boolean userExists(String userId) {
        return userRepository.existsById(userId);
    }
    
    /**
     * Validate JWT token and get user
     */
    public Optional<User> validateTokenAndGetUser(String token) {
        if (!jwtUtils.validateJwtToken(token)) {
            return Optional.empty();
        }
        
        String userId = jwtUtils.getUserIdFromJwtToken(token);
        return userRepository.findById(userId);
    }
}
