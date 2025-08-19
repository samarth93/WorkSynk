package com.workspace.app.controller;

import com.workspace.app.dto.MessageRequest;
import com.workspace.app.model.Message;
import com.workspace.app.security.JwtUtils;
import com.workspace.app.service.MessageService;
import com.workspace.app.service.RoomService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

/**
 * WebSocket Controller for real-time chat functionality
 * Handles real-time message sending and broadcasting
 */
@Controller
public class ChatController {
    
    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);
    
    @Autowired
    private MessageService messageService;
    
    @Autowired
    private RoomService roomService;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    /**
     * Handle sending messages to a room
     * WebSocket endpoint: /app/chat.sendMessage
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload MessageRequest messageRequest, @Header("Authorization") String authHeader) {
        try {
            // Extract user ID from JWT token
            String userId = extractUserIdFromAuth(authHeader);
            if (userId == null) {
                return; // Invalid token, ignore message
            }
            
            // Send message
            Message message = messageService.sendMessage(messageRequest, userId);
            
            // Broadcast message to all room subscribers
            messagingTemplate.convertAndSend("/topic/room/" + messageRequest.getRoomId(), message);
            
        } catch (Exception e) {
            logger.error("Error sending message: {}", e.getMessage(), e);
            // Send error message back to sender
            messagingTemplate.convertAndSendToUser(
                extractUserIdFromAuth(authHeader), 
                "/queue/errors", 
                Map.of("error", "Failed to send message. Please try again.")
            );
        }
    }
    
    /**
     * Handle user joining a room
     * WebSocket endpoint: /app/chat.joinRoom
     */
    @MessageMapping("/chat.joinRoom/{roomId}")
    public void joinRoom(@DestinationVariable String roomId, @Header("Authorization") String authHeader) {
        try {
            String userId = extractUserIdFromAuth(authHeader);
            if (userId == null) {
                return;
            }
            
            // Verify user is a member of the room
            if (!roomService.isUserMemberOfRoom(userId, roomId)) {
                return; // User not authorized for this room
            }
            
            // Send system message about user joining
            Message systemMessage = messageService.sendSystemMessage(roomId, "A user joined the room");
            
            // Broadcast to room
            messagingTemplate.convertAndSend("/topic/room/" + roomId, systemMessage);
            
            // Send confirmation to user
            messagingTemplate.convertAndSendToUser(
                userId, 
                "/queue/room-joined", 
                Map.of("roomId", roomId, "status", "joined")
            );
            
        } catch (Exception e) {
            logger.error("Error joining room: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Handle user leaving a room
     * WebSocket endpoint: /app/chat.leaveRoom
     */
    @MessageMapping("/chat.leaveRoom/{roomId}")
    public void leaveRoom(@DestinationVariable String roomId, @Header("Authorization") String authHeader) {
        try {
            String userId = extractUserIdFromAuth(authHeader);
            if (userId == null) {
                return;
            }
            
            // Send system message about user leaving
            Message systemMessage = messageService.sendSystemMessage(roomId, "A user left the room");
            
            // Broadcast to room
            messagingTemplate.convertAndSend("/topic/room/" + roomId, systemMessage);
            
        } catch (Exception e) {
            System.err.println("Error leaving room: " + e.getMessage());
        }
    }
    
    /**
     * Handle typing indicator
     * WebSocket endpoint: /app/chat.typing
     */
    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload Map<String, String> typingData, @Header("Authorization") String authHeader) {
        try {
            String userId = extractUserIdFromAuth(authHeader);
            if (userId == null) {
                return;
            }
            
            String roomId = typingData.get("roomId");
            String username = typingData.get("username");
            boolean isTyping = Boolean.parseBoolean(typingData.get("isTyping"));
            
            // Verify user is a member of the room
            if (!roomService.isUserMemberOfRoom(userId, roomId)) {
                return;
            }
            
            // Broadcast typing status to room (except to sender)
            Map<String, Object> typingStatus = Map.of(
                "userId", userId,
                "username", username,
                "isTyping", isTyping
            );
            
            messagingTemplate.convertAndSend("/topic/room/" + roomId + "/typing", typingStatus);
            
        } catch (Exception e) {
            System.err.println("Error handling typing: " + e.getMessage());
        }
    }
    
    /**
     * Handle message editing
     * WebSocket endpoint: /app/chat.editMessage
     */
    @MessageMapping("/chat.editMessage")
    public void editMessage(@Payload Map<String, String> editData, @Header("Authorization") String authHeader) {
        try {
            String userId = extractUserIdFromAuth(authHeader);
            if (userId == null) {
                return;
            }
            
            String messageId = editData.get("messageId");
            String newText = editData.get("newText");
            
            // Edit message
            Message editedMessage = messageService.editMessage(messageId, newText, userId);
            
            // Broadcast edited message to room
            messagingTemplate.convertAndSend("/topic/room/" + editedMessage.getRoomId() + "/edit", editedMessage);
            
        } catch (Exception e) {
            System.err.println("Error editing message: " + e.getMessage());
            messagingTemplate.convertAndSendToUser(
                extractUserIdFromAuth(authHeader), 
                "/queue/errors", 
                Map.of("error", e.getMessage())
            );
        }
    }
    
    /**
     * Handle message deletion
     * WebSocket endpoint: /app/chat.deleteMessage
     */
    @MessageMapping("/chat.deleteMessage")
    public void deleteMessage(@Payload Map<String, String> deleteData, @Header("Authorization") String authHeader) {
        try {
            String userId = extractUserIdFromAuth(authHeader);
            if (userId == null) {
                return;
            }
            
            String messageId = deleteData.get("messageId");
            
            // Delete message
            Message deletedMessage = messageService.deleteMessage(messageId, userId);
            
            // Broadcast deleted message to room
            messagingTemplate.convertAndSend("/topic/room/" + deletedMessage.getRoomId() + "/delete", deletedMessage);
            
        } catch (Exception e) {
            System.err.println("Error deleting message: " + e.getMessage());
            messagingTemplate.convertAndSendToUser(
                extractUserIdFromAuth(authHeader), 
                "/queue/errors", 
                Map.of("error", e.getMessage())
            );
        }
    }
    
    /**
     * Handle video call start (placeholder for future video integration)
     * WebSocket endpoint: /app/chat.startVideoCall
     */
    @MessageMapping("/chat.startVideoCall")
    public void startVideoCall(@Payload Map<String, String> videoData, @Header("Authorization") String authHeader) {
        try {
            String userId = extractUserIdFromAuth(authHeader);
            if (userId == null) {
                return;
            }
            
            String roomId = videoData.get("roomId");
            String videoCallData = videoData.get("videoCallData");
            
            // Initialize video call in room service
            String videoCallRoomId = roomService.initializeVideoCall(roomId, userId);
            
            // Send video call start message
            Message videoMessage = messageService.sendVideoCallStartMessage(roomId, userId, videoCallData);
            
            // Broadcast video call start to room
            Map<String, Object> videoCallInfo = Map.of(
                "message", videoMessage,
                "videoCallRoomId", videoCallRoomId,
                "action", "video_call_started"
            );
            
            messagingTemplate.convertAndSend("/topic/room/" + roomId + "/video", videoCallInfo);
            
        } catch (Exception e) {
            System.err.println("Error starting video call: " + e.getMessage());
            messagingTemplate.convertAndSendToUser(
                extractUserIdFromAuth(authHeader), 
                "/queue/errors", 
                Map.of("error", e.getMessage())
            );
        }
    }
    
    /**
     * Handle video call end (placeholder for future video integration)
     * WebSocket endpoint: /app/chat.endVideoCall
     */
    @MessageMapping("/chat.endVideoCall")
    public void endVideoCall(@Payload Map<String, String> videoData, @Header("Authorization") String authHeader) {
        try {
            String userId = extractUserIdFromAuth(authHeader);
            if (userId == null) {
                return;
            }
            
            String roomId = videoData.get("roomId");
            String videoCallData = videoData.get("videoCallData");
            
            // End video call in room service
            roomService.endVideoCall(roomId, userId);
            
            // Send video call end message
            Message videoMessage = messageService.sendVideoCallEndMessage(roomId, userId, videoCallData);
            
            // Broadcast video call end to room
            Map<String, Object> videoCallInfo = Map.of(
                "message", videoMessage,
                "action", "video_call_ended"
            );
            
            messagingTemplate.convertAndSend("/topic/room/" + roomId + "/video", videoCallInfo);
            
        } catch (Exception e) {
            System.err.println("Error ending video call: " + e.getMessage());
            messagingTemplate.convertAndSendToUser(
                extractUserIdFromAuth(authHeader), 
                "/queue/errors", 
                Map.of("error", e.getMessage())
            );
        }
    }
    
    /**
     * Extract user ID from Authorization header
     */
    private String extractUserIdFromAuth(String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return null;
            }
            
            String token = authHeader.substring(7);
            if (!jwtUtils.validateJwtToken(token)) {
                return null;
            }
            
            return jwtUtils.getUserIdFromJwtToken(token);
        } catch (Exception e) {
            System.err.println("Error extracting user ID: " + e.getMessage());
            return null;
        }
    }
}
