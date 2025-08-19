package com.workspace.app.service;

import com.workspace.app.model.User;
import com.workspace.app.model.Workspace;
import com.workspace.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Service to handle application startup tasks
 */
@Service
public class StartupService implements ApplicationRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private WorkspaceService workspaceService;
    
    private static final String DEFAULT_ADMIN_EMAIL = "palsamarth9@gmail.com";
    
    @Override
    public void run(ApplicationArguments args) {
        setupDefaultWorkspace();
    }
    
    /**
     * Set up default workspace and admin user - UPDATED FOR NEW FLOW
     */
    private void setupDefaultWorkspace() {
        try {
            // Check if default admin user exists
            Optional<User> adminUserOpt = userRepository.findByEmail(DEFAULT_ADMIN_EMAIL);
            
            if (adminUserOpt.isPresent()) {
                User adminUser = adminUserOpt.get();
                
                // Check if admin already has a workspace
                if (adminUser.getCurrentWorkspaceId() == null || adminUser.getWorkspaceIds().isEmpty()) {
                    // Create default workspace for admin
                    try {
                        Workspace defaultWorkspace = workspaceService.setupDefaultWorkspace(DEFAULT_ADMIN_EMAIL);
                        System.out.println("✅ Default workspace created for admin: " + defaultWorkspace.getName());
                        
                        // Update user's current workspace
                        adminUser.setCurrentWorkspaceId(defaultWorkspace.getId());
                        adminUser.addWorkspace(defaultWorkspace.getId());
                        userRepository.save(adminUser);
                        
                    } catch (Exception e) {
                        System.err.println("⚠️ Could not create default workspace: " + e.getMessage());
                    }
                } else {
                    System.out.println("✅ Admin user already has workspace setup");
                }
            } else {
                System.out.println("ℹ️ Default admin user not found. Will be created when user registers.");
                System.out.println("📝 To register as admin, use email: " + DEFAULT_ADMIN_EMAIL);
            }
        } catch (Exception e) {
            System.err.println("⚠️ Error during startup workspace setup: " + e.getMessage());
        }
    }
}
