package com.workspace.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * User Entity for workspace application
 * Stores user information including authentication data
 */
@Document(collection = "users")
public class User {
    
    @Id
    private String id;
    
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
    @Indexed(unique = true)
    private String username;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email")
    @Indexed(unique = true)
    private String email;
    
    @NotBlank(message = "Password is required")
    private String passwordHash;
    
    private String firstName;
    private String lastName;
    private String profilePictureUrl;
    
    // Extended profile information
    private String designation;
    private String role;
    private String bio;
    private String status = "online"; // online, offline, vacation, medical_leave, busy, away
    
    // List of room IDs the user is a member of
    private List<String> joinedRooms = new ArrayList<>();
    
    // List of room IDs the user is an admin of
    private List<String> adminRooms = new ArrayList<>();
    
    // Workspace membership
    private String currentWorkspaceId; // Current active workspace
    private List<String> workspaceIds = new ArrayList<>(); // All workspaces user belongs to
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    private LocalDateTime lastLoginAt;
    private boolean isActive = true;
    
    // Future video call integration placeholder
    private boolean videoCallEnabled = true;
    private String videoCallUserPreferences; // JSON string for video call settings
    
    // Constructors
    public User() {}
    
    public User(String username, String email, String passwordHash) {
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPasswordHash() {
        return passwordHash;
    }
    
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }
    
    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }
    
    public List<String> getJoinedRooms() {
        return joinedRooms;
    }
    
    public void setJoinedRooms(List<String> joinedRooms) {
        this.joinedRooms = joinedRooms;
    }
    
    public List<String> getAdminRooms() {
        return adminRooms;
    }
    
    public void setAdminRooms(List<String> adminRooms) {
        this.adminRooms = adminRooms;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getLastLoginAt() {
        return lastLoginAt;
    }
    
    public void setLastLoginAt(LocalDateTime lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }
    
    public boolean isActive() {
        return isActive;
    }
    
    public void setActive(boolean active) {
        isActive = active;
    }
    
    public boolean isVideoCallEnabled() {
        return videoCallEnabled;
    }
    
    public void setVideoCallEnabled(boolean videoCallEnabled) {
        this.videoCallEnabled = videoCallEnabled;
    }
    
    public String getVideoCallUserPreferences() {
        return videoCallUserPreferences;
    }
    
    public void setVideoCallUserPreferences(String videoCallUserPreferences) {
        this.videoCallUserPreferences = videoCallUserPreferences;
    }
    
    public String getDesignation() {
        return designation;
    }
    
    public void setDesignation(String designation) {
        this.designation = designation;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public String getBio() {
        return bio;
    }
    
    public void setBio(String bio) {
        this.bio = bio;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    // Helper methods
    public void addJoinedRoom(String roomId) {
        if (!joinedRooms.contains(roomId)) {
            joinedRooms.add(roomId);
        }
    }
    
    public void removeJoinedRoom(String roomId) {
        joinedRooms.remove(roomId);
    }
    
    public void addAdminRoom(String roomId) {
        if (!adminRooms.contains(roomId)) {
            adminRooms.add(roomId);
        }
    }
    
    public void removeAdminRoom(String roomId) {
        adminRooms.remove(roomId);
    }
    
    public boolean isAdminOfRoom(String roomId) {
        return adminRooms.contains(roomId);
    }
    
    public boolean isMemberOfRoom(String roomId) {
        return joinedRooms.contains(roomId);
    }
    
    // Workspace-related getters and setters
    public String getCurrentWorkspaceId() {
        return currentWorkspaceId;
    }
    
    public void setCurrentWorkspaceId(String currentWorkspaceId) {
        this.currentWorkspaceId = currentWorkspaceId;
    }
    
    public List<String> getWorkspaceIds() {
        return workspaceIds;
    }
    
    public void setWorkspaceIds(List<String> workspaceIds) {
        this.workspaceIds = workspaceIds;
    }
    
    // Workspace helper methods
    public void addWorkspace(String workspaceId) {
        if (!workspaceIds.contains(workspaceId)) {
            workspaceIds.add(workspaceId);
        }
        if (currentWorkspaceId == null) {
            currentWorkspaceId = workspaceId;
        }
    }
    
    public void removeWorkspace(String workspaceId) {
        workspaceIds.remove(workspaceId);
        if (workspaceId.equals(currentWorkspaceId)) {
            currentWorkspaceId = workspaceIds.isEmpty() ? null : workspaceIds.get(0);
        }
    }
    
    public boolean isMemberOfWorkspace(String workspaceId) {
        return workspaceIds.contains(workspaceId);
    }
}
