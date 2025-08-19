package com.workspace.app.controller;

import com.workspace.app.dto.ApiResponse;
import com.workspace.app.dto.CreateRoomRequest;
import com.workspace.app.model.Room;
import com.workspace.app.service.RoomService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST Controller for room management endpoints
 * Handles room creation, joining, leaving, and management operations
 */
@RestController
@RequestMapping("/rooms")
@CrossOrigin(origins = "*", maxAge = 3600)
public class RoomController {
    
    @Autowired
    private RoomService roomService;
    
    /**
     * Create a new room
     * POST /api/rooms
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Room>> createRoom(
            @Valid @RequestBody CreateRoomRequest request,
            HttpServletRequest httpRequest) {
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse.error("User not authenticated")
                );
            }
            
            Room room = roomService.createRoom(request, userId);
            
            return ResponseEntity.ok(
                ApiResponse.success("Room created successfully", room)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error(e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to create room: " + e.getMessage())
            );
        }
    }
    
    /**
     * Get all rooms (for browsing)
     * GET /api/rooms
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Room>>> getAllRooms(HttpServletRequest httpRequest) {
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse.error("User not authenticated")
                );
            }
            
            List<Room> rooms = roomService.getAllRooms();
            
            return ResponseEntity.ok(
                ApiResponse.success("All rooms retrieved", rooms)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to get rooms: " + e.getMessage())
            );
        }
    }
    
    /**
     * Get all public rooms
     * GET /api/rooms/public
     */
    @GetMapping("/public")
    public ResponseEntity<ApiResponse<List<Room>>> getPublicRooms() {
        try {
            List<Room> rooms = roomService.getPublicRooms();
            
            return ResponseEntity.ok(
                ApiResponse.success("Public rooms retrieved", rooms)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to get public rooms: " + e.getMessage())
            );
        }
    }
    
    /**
     * Get user's rooms
     * GET /api/rooms/my
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Room>>> getMyRooms(HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse.error("User not authenticated")
                );
            }
            
            List<Room> rooms = roomService.getUserRooms(userId);
            
            return ResponseEntity.ok(
                ApiResponse.success("User rooms retrieved", rooms)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to get user rooms: " + e.getMessage())
            );
        }
    }
    
    /**
     * Get rooms where user is admin
     * GET /api/rooms/admin
     */
    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<List<Room>>> getAdminRooms(HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse.error("User not authenticated")
                );
            }
            
            List<Room> rooms = roomService.getUserAdminRooms(userId);
            
            return ResponseEntity.ok(
                ApiResponse.success("Admin rooms retrieved", rooms)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to get admin rooms: " + e.getMessage())
            );
        }
    }
    
    /**
     * Get room by ID
     * GET /api/rooms/{roomId}
     */
    @GetMapping("/{roomId}")
    public ResponseEntity<ApiResponse<Room>> getRoom(@PathVariable String roomId) {
        try {
            Optional<Room> roomOptional = roomService.getRoomById(roomId);
            
            if (roomOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ApiResponse.error("Room not found")
                );
            }
            
            return ResponseEntity.ok(
                ApiResponse.success("Room retrieved", roomOptional.get())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to get room: " + e.getMessage())
            );
        }
    }
    
    /**
     * Join a room
     * POST /api/rooms/{roomId}/join
     */
    @PostMapping("/{roomId}/join")
    public ResponseEntity<ApiResponse<Room>> joinRoom(
            @PathVariable String roomId,
            HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse.error("User not authenticated")
                );
            }
            
            Room room = roomService.joinRoom(roomId, userId);
            
            return ResponseEntity.ok(
                ApiResponse.success("Successfully joined room", room)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error(e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to join room: " + e.getMessage())
            );
        }
    }
    
    /**
     * Leave a room
     * POST /api/rooms/{roomId}/leave
     */
    @PostMapping("/{roomId}/leave")
    public ResponseEntity<ApiResponse<Room>> leaveRoom(
            @PathVariable String roomId,
            HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse.error("User not authenticated")
                );
            }
            
            Room room = roomService.leaveRoom(roomId, userId);
            
            return ResponseEntity.ok(
                ApiResponse.success("Successfully left room", room)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error(e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to leave room: " + e.getMessage())
            );
        }
    }
    
    /**
     * Update room details (admin only)
     * PUT /api/rooms/{roomId}
     */
    @PutMapping("/{roomId}")
    public ResponseEntity<ApiResponse<Room>> updateRoom(
            @PathVariable String roomId,
            @RequestBody Room updatedRoom,
            HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse.error("User not authenticated")
                );
            }
            
            Room room = roomService.updateRoom(roomId, userId, updatedRoom);
            
            return ResponseEntity.ok(
                ApiResponse.success("Room updated successfully", room)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error(e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to update room: " + e.getMessage())
            );
        }
    }
    
    /**
     * Delete a room (admin only)
     * DELETE /api/rooms/{roomId}
     */
    @DeleteMapping("/{roomId}")
    public ResponseEntity<ApiResponse<String>> deleteRoom(
            @PathVariable String roomId,
            HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse.error("User not authenticated")
                );
            }
            
            roomService.deleteRoom(roomId, userId);
            
            return ResponseEntity.ok(
                ApiResponse.success("Room deleted successfully")
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error(e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to delete room: " + e.getMessage())
            );
        }
    }
    
    /**
     * Transfer admin rights
     * POST /api/rooms/{roomId}/transfer-admin
     */
    @PostMapping("/{roomId}/transfer-admin")
    public ResponseEntity<ApiResponse<Room>> transferAdmin(
            @PathVariable String roomId,
            @RequestBody Map<String, String> requestBody,
            HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");
            String newAdminId = requestBody.get("newAdminId");
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse.error("User not authenticated")
                );
            }
            
            if (newAdminId == null) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.error("New admin ID is required")
                );
            }
            
            Room room = roomService.transferAdminRights(roomId, userId, newAdminId);
            
            return ResponseEntity.ok(
                ApiResponse.success("Admin rights transferred successfully", room)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error(e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to transfer admin rights: " + e.getMessage())
            );
        }
    }
    
    /**
     * Search rooms by name
     * GET /api/rooms/search?name=room-name
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Room>>> searchRooms(@RequestParam String name) {
        try {
            List<Room> rooms = roomService.searchRooms(name);
            
            return ResponseEntity.ok(
                ApiResponse.success("Rooms found", rooms)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Search failed: " + e.getMessage())
            );
        }
    }
    
    /**
     * Get popular rooms
     * GET /api/rooms/popular
     */
    @GetMapping("/popular")
    public ResponseEntity<ApiResponse<List<Room>>> getPopularRooms() {
        try {
            List<Room> rooms = roomService.getPopularRooms();
            
            return ResponseEntity.ok(
                ApiResponse.success("Popular rooms retrieved", rooms)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to get popular rooms: " + e.getMessage())
            );
        }
    }
    
    /**
     * Get room members
     * GET /api/rooms/{roomId}/members
     */
    @GetMapping("/{roomId}/members")
    public ResponseEntity<ApiResponse<List<String>>> getRoomMembers(@PathVariable String roomId) {
        try {
            List<String> members = roomService.getRoomMembers(roomId);
            
            return ResponseEntity.ok(
                ApiResponse.success("Room members retrieved", members)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error(e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to get room members: " + e.getMessage())
            );
        }
    }
    
    /**
     * Initialize video call (placeholder for future video integration)
     * POST /api/rooms/{roomId}/video/start
     */
    @PostMapping("/{roomId}/video/start")
    public ResponseEntity<ApiResponse<String>> startVideoCall(
            @PathVariable String roomId,
            HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse.error("User not authenticated")
                );
            }
            
            String videoCallRoomId = roomService.initializeVideoCall(roomId, userId);
            
            return ResponseEntity.ok(
                ApiResponse.success("Video call initialized", videoCallRoomId)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error(e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to start video call: " + e.getMessage())
            );
        }
    }
    
    /**
     * End video call (placeholder for future video integration)
     * POST /api/rooms/{roomId}/video/end
     */
    @PostMapping("/{roomId}/video/end")
    public ResponseEntity<ApiResponse<String>> endVideoCall(
            @PathVariable String roomId,
            HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse.error("User not authenticated")
                );
            }
            
            roomService.endVideoCall(roomId, userId);
            
            return ResponseEntity.ok(
                ApiResponse.success("Video call ended")
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error(e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to end video call: " + e.getMessage())
            );
        }
    }
}
