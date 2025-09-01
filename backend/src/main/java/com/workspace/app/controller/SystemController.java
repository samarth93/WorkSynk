package com.workspace.app.controller;

import com.workspace.app.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * System status and health check endpoints
 */
@RestController
@RequestMapping("/system")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SystemController {

    /**
     * Get system status
     * GET /api/system/status
     */
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemStatus() {
        try {
            Map<String, Object> status = new HashMap<>();
            status.put("status", "UP");
            status.put("timestamp", LocalDateTime.now());
            status.put("service", "workspace-app-backend");
            status.put("version", "1.0.0");
            status.put("database", "CONNECTED");
            status.put("jwt", "ENABLED");
            
            return ResponseEntity.ok(
                ApiResponse.success("System is running normally", status)
            );
        } catch (Exception e) {
            Map<String, Object> errorStatus = new HashMap<>();
            errorStatus.put("status", "DOWN");
            errorStatus.put("timestamp", LocalDateTime.now());
            errorStatus.put("error", e.getMessage());
            
            return ResponseEntity.status(503).body(
                ApiResponse.error("System health check failed", errorStatus)
            );
        }
    }

    /**
     * Get application information
     */
    @GetMapping("/info")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getApplicationInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("name", "Professional Workspace Application");
        info.put("version", "1.0.0");
        info.put("description", "Full-stack workspace with chat and video calling");
        info.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.ok(
            ApiResponse.success("Application information retrieved", info)
        );
    }
}
