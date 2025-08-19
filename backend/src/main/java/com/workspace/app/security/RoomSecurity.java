package com.workspace.app.security;

import com.workspace.app.model.Room;
import com.workspace.app.repository.RoomRepository;
import com.workspace.app.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Optional;

@Component("roomSecurity")
public class RoomSecurity {
    
    @Autowired
    private RoomRepository roomRepository;
    
    /**
     * Check if the current user can start a video call for the given room
     * Only room admins can start calls
     */
    public boolean canStartCall(String roomId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        // Get user ID from request attributes (set by JWT filter)
        String userId = getCurrentUserId();
        
        Optional<Room> roomOptional = roomRepository.findById(roomId);
        if (roomOptional.isEmpty()) {
            return false;
        }
        
        Room room = roomOptional.get();
        return room.isAdmin(userId);
    }
    
    /**
     * Check if the current user can join a video call for the given room
     * Room members can join calls
     */
    public boolean canJoinCall(String roomId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        String userId = getCurrentUserId();
        
        Optional<Room> roomOptional = roomRepository.findById(roomId);
        if (roomOptional.isEmpty()) {
            return false;
        }
        
        Room room = roomOptional.get();
        return room.isMember(userId);
    }
    
    /**
     * Get current user ID from request attributes
     */
    private String getCurrentUserId() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            Object userIdObj = request.getAttribute("userId");
            if (userIdObj != null) {
                return (String) userIdObj;
            }
        }
        return null;
    }
}
