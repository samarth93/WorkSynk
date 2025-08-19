package com.workspace.app.controller;

import com.workspace.app.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Health check controller for monitoring application status
 */
@RestController
@RequestMapping("")
@CrossOrigin(origins = "*", maxAge = 3600)
public class HealthController {
    
    /**
     * Basic health check endpoint
     * GET /api/health
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> healthCheck() {
        Map<String, Object> healthData = Map.of(
            "status", "UP",
            "service", "Workspace App Backend",
            "timestamp", LocalDateTime.now(),
            "version", "1.0.0",
            "features", Map.of(
                "authentication", "JWT-based",
                "chat", "WebSocket + REST",
                "database", "MongoDB",
                "videoCallReady", true
            )
        );
        
        return ResponseEntity.ok(
            ApiResponse.success("Service is healthy", healthData)
        );
    }
    
    /**
     * API information endpoint
     * GET /api/info
     */
    @GetMapping("/info")
    public ResponseEntity<ApiResponse<Map<String, Object>>> apiInfo() {
        Map<String, Object> apiInfo = Map.of(
            "name", "Workspace App Backend API",
            "version", "1.0.0",
            "description", "Professional workspace application with chat and future video call support",
            "endpoints", Map.of(
                "auth", "/api/auth/*",
                "users", "/api/users/*",
                "rooms", "/api/rooms/*",
                "messages", "/api/messages/*",
                "websocket", "/ws"
            ),
            "features", Map.of(
                "userAuthentication", true,
                "roomManagement", true,
                "realTimeChat", true,
                "videoCallSupport", "coming soon"
            )
        );
        
        return ResponseEntity.ok(
            ApiResponse.success("API information", apiInfo)
        );
    }
}
