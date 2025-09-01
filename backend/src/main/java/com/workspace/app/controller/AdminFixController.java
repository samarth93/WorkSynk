package com.workspace.app.controller;

import com.workspace.app.dto.ApiResponse;
import com.workspace.app.model.User;
import com.workspace.app.model.Workspace;
import com.workspace.app.repository.UserRepository;
import com.workspace.app.repository.WorkspaceRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.HashSet;
import java.util.Set;

/**
 * Temporary controller to fix existing admin users
 * This adds the isGlobalAdmin flag to existing workspace creators
 */
@RestController
@RequestMapping("/admin/fix")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminFixController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private WorkspaceRepository workspaceRepository;
    
    /**
     * Fix existing admin users by setting isGlobalAdmin = true for workspace creators
     * GET /api/admin/fix/existing-admins
     */
    @GetMapping("/existing-admins")
    public ResponseEntity<ApiResponse<String>> fixExistingAdmins() {
        try {
            StringBuilder report = new StringBuilder();
            report.append("🔍 ADMIN USERS FIX REPORT\n\n");
            
            // Find all workspaces and their admin IDs
            List<Workspace> workspaces = workspaceRepository.findAll();
            Set<String> workspaceAdminIds = new HashSet<>();
            
            report.append("📁 WORKSPACES FOUND:\n");
            for (Workspace workspace : workspaces) {
                String adminId = workspace.getAdminId();
                if (adminId != null) {
                    workspaceAdminIds.add(adminId);
                    Optional<User> adminUser = userRepository.findById(adminId);
                    String adminEmail = adminUser.map(User::getEmail).orElse("Unknown");
                    report.append(String.format("   - %s (Admin: %s)\n", workspace.getName(), adminEmail));
                }
            }
            
            report.append(String.format("\n👥 WORKSPACE ADMINS TO UPDATE: %d\n\n", workspaceAdminIds.size()));
            
            // Update workspace admin users
            int updatedCount = 0;
            for (String adminId : workspaceAdminIds) {
                Optional<User> userOpt = userRepository.findById(adminId);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    if (!user.isGlobalAdmin()) {
                        user.setGlobalAdmin(true);
                        userRepository.save(user);
                        updatedCount++;
                        report.append(String.format("   ✅ Updated %s to global admin\n", user.getEmail()));
                    } else {
                        report.append(String.format("   ℹ️ %s was already global admin\n", user.getEmail()));
                    }
                }
            }
            
            // Also ensure the hardcoded admin email is global admin
            Optional<User> hardcodedAdmin = userRepository.findByEmail("palsamarth9@gmail.com");
            if (hardcodedAdmin.isPresent()) {
                User user = hardcodedAdmin.get();
                if (!user.isGlobalAdmin()) {
                    user.setGlobalAdmin(true);
                    userRepository.save(user);
                    updatedCount++;
                    report.append(String.format("   ✅ Updated hardcoded admin %s to global admin\n", user.getEmail()));
                }
            }
            
            report.append(String.format("\n🎉 SUMMARY: Updated %d users to global admin status\n\n", updatedCount));
            
            // Show final status of all users
            List<User> allUsers = userRepository.findAll();
            report.append("📊 FINAL USER STATUS:\n");
            for (User user : allUsers) {
                report.append(String.format("   👤 %s: isGlobalAdmin = %s\n", 
                    user.getEmail(), user.isGlobalAdmin()));
            }
            
            return ResponseEntity.ok(
                ApiResponse.success("Admin users fixed successfully", report.toString())
            );
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                ApiResponse.error("Failed to fix admin users: " + e.getMessage())
            );
        }
    }
}
