package com.workspace.app.controller;

import com.workspace.app.dto.ApiResponse;
import com.workspace.app.service.VideoSdkRoomService;
import com.workspace.app.service.VideoSdkTokenService;
import com.workspace.app.service.RoomService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/video")
@CrossOrigin(origins = "*", maxAge = 3600)
public class VideoController {
    
    @Autowired
    private VideoSdkTokenService tokenService;
    
    @Autowired
    private VideoSdkRoomService roomService;
    
    @Autowired
    private RoomService roomPersistence;

    @GetMapping("/token")
    public ResponseEntity<Map<String, String>> getToken(
            @RequestParam(defaultValue = "rtc") String role,
            @RequestParam(defaultValue = "false") boolean moderator,
            @RequestParam Optional<String> roomId) {
        try {
            String token = tokenService.generateToken(role, moderator, roomId, Optional.empty());
            return ResponseEntity.ok(Map.of("token", token));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to generate token: " + e.getMessage()));
        }
    }

    @PostMapping("/rooms/start")
    @PreAuthorize("@roomSecurity.canStartCall(#payload.roomId, authentication)")
    public Mono<ResponseEntity<ApiResponse<Map<String,String>>>> startRoom(
            @RequestBody StartPayload payload,
            HttpServletRequest request) {
        
        String customId = "room-" + payload.roomId;
        return roomService.createRoom(customId)
                .flatMap(videoRoomId -> {
                    try {
                        roomPersistence.attachVideoRoom(payload.roomId, videoRoomId, payload.startedByUserId);
                        return Mono.just(ResponseEntity.ok(
                                ApiResponse.success("Video room started successfully", 
                                        Map.of("videoRoomId", videoRoomId))
                        ));
                    } catch (Exception e) {
                        return Mono.just(ResponseEntity.badRequest().body(
                                ApiResponse.<Map<String,String>>error("Failed to start video room: " + e.getMessage())
                        ));
                    }
                })
                .onErrorReturn(ResponseEntity.badRequest().body(
                        ApiResponse.<Map<String,String>>error("Failed to create VideoSDK room")
                ));
    }
    
    @PostMapping("/rooms/{roomId}/end")
    @PreAuthorize("@roomSecurity.canStartCall(#roomId, authentication)")
    public ResponseEntity<ApiResponse<String>> endRoom(
            @PathVariable String roomId,
            HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");
            
            if (userId == null) {
                return ResponseEntity.status(401).body(
                        ApiResponse.error("User not authenticated")
                );
            }
            
            roomPersistence.endVideoCall(roomId, userId);
            
            return ResponseEntity.ok(
                    ApiResponse.success("Video call ended successfully", "Call ended")
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.error(e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    ApiResponse.error("Failed to end video call: " + e.getMessage())
            );
        }
    }

    public static class StartPayload {
        private String roomId;
        private String startedByUserId;
        
        // Constructors
        public StartPayload() {}
        
        public StartPayload(String roomId, String startedByUserId) {
            this.roomId = roomId;
            this.startedByUserId = startedByUserId;
        }
        
        // Getters and Setters
        public String getRoomId() {
            return roomId;
        }
        
        public void setRoomId(String roomId) {
            this.roomId = roomId;
        }
        
        public String getStartedByUserId() {
            return startedByUserId;
        }
        
        public void setStartedByUserId(String startedByUserId) {
            this.startedByUserId = startedByUserId;
        }
    }
}
