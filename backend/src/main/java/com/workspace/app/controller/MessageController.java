package com.workspace.app.controller;

import com.workspace.app.dto.ApiResponse;
import com.workspace.app.dto.MessageRequest;
import com.workspace.app.model.Message;
import com.workspace.app.service.MessageService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST Controller for message management endpoints
 * Handles HTTP requests for message operations
 */
@RestController
@RequestMapping("/messages")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MessageController {
    
    @Autowired
    private MessageService messageService;
    
    /**
     * Send a message (REST API alternative to WebSocket)
     * POST /api/messages
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Message>> sendMessage(
            @Valid @RequestBody MessageRequest request,
            HttpServletRequest httpRequest) {
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse.error("User not authenticated")
                );
            }
            
            Message message = messageService.sendMessage(request, userId);
            
            return ResponseEntity.ok(
                ApiResponse.success("Message sent successfully", message)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error(e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to send message: " + e.getMessage())
            );
        }
    }
    
    /**
     * Get messages for a room with pagination
     * GET /api/messages/room/{roomId}?page=0&size=20
     */
    @GetMapping("/room/{roomId}")
    public ResponseEntity<ApiResponse<Page<Message>>> getRoomMessages(
            @PathVariable String roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse.error("User not authenticated")
                );
            }
            
            Page<Message> messages = messageService.getRoomMessages(roomId, page, size, userId);
            
            return ResponseEntity.ok(
                ApiResponse.success("Messages retrieved", messages)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error(e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to get messages: " + e.getMessage())
            );
        }
    }
    
    /**
     * Get recent messages for a room (last 50)
     * GET /api/messages/room/{roomId}/recent
     */
    @GetMapping("/room/{roomId}/recent")
    public ResponseEntity<ApiResponse<List<Message>>> getRecentRoomMessages(
            @PathVariable String roomId,
            HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse.error("User not authenticated")
                );
            }
            
            List<Message> messages = messageService.getRecentRoomMessages(roomId, userId);
            
            return ResponseEntity.ok(
                ApiResponse.success("Recent messages retrieved", messages)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error(e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to get recent messages: " + e.getMessage())
            );
        }
    }
    
    /**
     * Edit a message
     * PUT /api/messages/{messageId}
     */
    @PutMapping("/{messageId}")
    public ResponseEntity<ApiResponse<Message>> editMessage(
            @PathVariable String messageId,
            @RequestBody Map<String, String> requestBody,
            HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");
            String newText = requestBody.get("text");
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse.error("User not authenticated")
                );
            }
            
            if (newText == null || newText.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.error("Message text is required")
                );
            }
            
            Message message = messageService.editMessage(messageId, newText, userId);
            
            return ResponseEntity.ok(
                ApiResponse.success("Message edited successfully", message)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error(e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to edit message: " + e.getMessage())
            );
        }
    }
    
    /**
     * Delete a message
     * DELETE /api/messages/{messageId}
     */
    @DeleteMapping("/{messageId}")
    public ResponseEntity<ApiResponse<Message>> deleteMessage(
            @PathVariable String messageId,
            HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse.error("User not authenticated")
                );
            }
            
            Message message = messageService.deleteMessage(messageId, userId);
            
            return ResponseEntity.ok(
                ApiResponse.success("Message deleted successfully", message)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error(e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to delete message: " + e.getMessage())
            );
        }
    }
    
    /**
     * Get message by ID
     * GET /api/messages/{messageId}
     */
    @GetMapping("/{messageId}")
    public ResponseEntity<ApiResponse<Message>> getMessage(@PathVariable String messageId) {
        try {
            Optional<Message> messageOptional = messageService.getMessageById(messageId);
            
            if (messageOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ApiResponse.error("Message not found")
                );
            }
            
            return ResponseEntity.ok(
                ApiResponse.success("Message retrieved", messageOptional.get())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to get message: " + e.getMessage())
            );
        }
    }
    
    /**
     * Search messages in a room
     * GET /api/messages/room/{roomId}/search?text=search-term
     */
    @GetMapping("/room/{roomId}/search")
    public ResponseEntity<ApiResponse<List<Message>>> searchMessages(
            @PathVariable String roomId,
            @RequestParam String text,
            HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse.error("User not authenticated")
                );
            }
            
            List<Message> messages = messageService.searchMessages(roomId, text, userId);
            
            return ResponseEntity.ok(
                ApiResponse.success("Search results", messages)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error(e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Search failed: " + e.getMessage())
            );
        }
    }
    
    /**
     * Get threaded messages (replies to a parent message)
     * GET /api/messages/{parentMessageId}/replies
     */
    @GetMapping("/{parentMessageId}/replies")
    public ResponseEntity<ApiResponse<List<Message>>> getThreadedMessages(
            @PathVariable String parentMessageId,
            HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse.error("User not authenticated")
                );
            }
            
            List<Message> messages = messageService.getThreadedMessages(parentMessageId, userId);
            
            return ResponseEntity.ok(
                ApiResponse.success("Threaded messages retrieved", messages)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error(e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to get threaded messages: " + e.getMessage())
            );
        }
    }
    
    /**
     * Get message count for a room
     * GET /api/messages/room/{roomId}/count
     */
    @GetMapping("/room/{roomId}/count")
    public ResponseEntity<ApiResponse<Long>> getMessageCount(@PathVariable String roomId) {
        try {
            long count = messageService.getMessageCountForRoom(roomId);
            
            return ResponseEntity.ok(
                ApiResponse.success("Message count retrieved", count)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to get message count: " + e.getMessage())
            );
        }
    }
    
    /**
     * Get latest message in a room
     * GET /api/messages/room/{roomId}/latest
     */
    @GetMapping("/room/{roomId}/latest")
    public ResponseEntity<ApiResponse<Message>> getLatestMessage(@PathVariable String roomId) {
        try {
            Optional<Message> messageOptional = messageService.getLatestMessageInRoom(roomId);
            
            if (messageOptional.isEmpty()) {
                return ResponseEntity.ok(
                    ApiResponse.success("No messages found", null)
                );
            }
            
            return ResponseEntity.ok(
                ApiResponse.success("Latest message retrieved", messageOptional.get())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to get latest message: " + e.getMessage())
            );
        }
    }
    
    /**
     * Get video call messages for a room (placeholder for future video integration)
     * GET /api/messages/room/{roomId}/video-calls
     */
    @GetMapping("/room/{roomId}/video-calls")
    public ResponseEntity<ApiResponse<List<Message>>> getVideoCallMessages(
            @PathVariable String roomId,
            HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse.error("User not authenticated")
                );
            }
            
            List<Message> messages = messageService.getVideoCallMessages(roomId, userId);
            
            return ResponseEntity.ok(
                ApiResponse.success("Video call messages retrieved", messages)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error(e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("Failed to get video call messages: " + e.getMessage())
            );
        }
    }
}
