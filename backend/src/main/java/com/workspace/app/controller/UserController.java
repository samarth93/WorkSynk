package com.workspace.app.controller;

import com.workspace.app.dto.ApiResponse;
import com.workspace.app.model.User;
import com.workspace.app.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST Controller for user management endpoints
 * Handles user profile operations and user-related queries
 */
@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {
    
    @Autowired
    private UserService userService;
    
    /**
     * Get current user profile
     * GET /api/users/me
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser(HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse.error("User not authenticated")
                );
            }
            
            Optional<User> userOptional = userService.getUserById(userId);
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ApiResponse.error("User not found")
                );
            }
            
            User user = userOptional.get();
            // Remove sensitive information
            user.setPasswordHash(null);
            
            return ResponseEntity.ok(
                ApiResponse.success("User profile retrieved", user)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to get user profile: " + e.getMessage())
            );
        }
    }
    
    /**
     * Update current user profile
     * PUT /api/users/me
     */
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<User>> updateCurrentUser(
            @RequestBody User updatedUser, 
            HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse.error("User not authenticated")
                );
            }
            
            User user = userService.updateUserProfile(userId, updatedUser);
            // Remove sensitive information
            user.setPasswordHash(null);
            
            return ResponseEntity.ok(
                ApiResponse.success("Profile updated successfully", user)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error(e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to update profile: " + e.getMessage())
            );
        }
    }
    
    /**
     * Change user password
     * POST /api/users/change-password
     */
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @RequestBody Map<String, String> passwordData,
            HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse.error("User not authenticated")
                );
            }
            
            String currentPassword = passwordData.get("currentPassword");
            String newPassword = passwordData.get("newPassword");
            
            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.error("Current password and new password are required")
                );
            }
            
            userService.changePassword(userId, currentPassword, newPassword);
            
            return ResponseEntity.ok(
                ApiResponse.success("Password changed successfully")
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error(e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to change password: " + e.getMessage())
            );
        }
    }
    
    /**
     * Search users by username
     * GET /api/users/search?username=john
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<User>>> searchUsers(@RequestParam String username) {
        try {
            List<User> users = userService.searchUsers(username);
            
            // Remove sensitive information from all users
            users.forEach(user -> user.setPasswordHash(null));
            
            return ResponseEntity.ok(
                ApiResponse.success("Users found", users)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Search failed: " + e.getMessage())
            );
        }
    }
    
    /**
     * Get user profile by ID
     * GET /api/users/{userId}
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable String userId) {
        try {
            Optional<User> userOptional = userService.getUserById(userId);
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ApiResponse.error("User not found")
                );
            }
            
            User user = userOptional.get();
            // Remove sensitive information
            user.setPasswordHash(null);
            
            return ResponseEntity.ok(
                ApiResponse.success("User profile retrieved", user)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to get user: " + e.getMessage())
            );
        }
    }
    
    /**
     * Deactivate user account
     * DELETE /api/users/me
     */
    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<String>> deactivateAccount(HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse.error("User not authenticated")
                );
            }
            
            userService.deactivateUser(userId);
            
            return ResponseEntity.ok(
                ApiResponse.success("Account deactivated successfully")
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error(e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to deactivate account: " + e.getMessage())
            );
        }
    }
    
    /**
     * Get user's rooms
     * GET /api/users/me/rooms
     */
    @GetMapping("/me/rooms")
    public ResponseEntity<ApiResponse<Map<String, List<String>>>> getUserRooms(HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse.error("User not authenticated")
                );
            }
            
            Optional<User> userOptional = userService.getUserById(userId);
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ApiResponse.error("User not found")
                );
            }
            
            User user = userOptional.get();
            Map<String, List<String>> rooms = Map.of(
                "joinedRooms", user.getJoinedRooms(),
                "adminRooms", user.getAdminRooms()
            );
            
            return ResponseEntity.ok(
                ApiResponse.success("User rooms retrieved", rooms)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to get user rooms: " + e.getMessage())
            );
        }
    }
}
