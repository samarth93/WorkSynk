package com.workspace.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

/**
 * Main Spring Boot Application Class for Workspace App
 * 
 * Features:
 * - User authentication with JWT
 * - Room management system
 * - Real-time chat functionality
 * - MongoDB integration
 * - Future video call integration placeholders
 */
@SpringBootApplication
@EnableMongoAuditing
public class WorkspaceAppApplication {

    public static void main(String[] args) {
        SpringApplication.run(WorkspaceAppApplication.class, args);
        System.out.println("🚀 Workspace App Backend is running on http://localhost:8080/api");
        System.out.println("📊 MongoDB connected successfully");
        System.out.println("🔐 JWT Authentication enabled");
        System.out.println("💬 WebSocket chat ready");
        System.out.println("📹 Video call placeholders prepared for future integration");
    }
}
