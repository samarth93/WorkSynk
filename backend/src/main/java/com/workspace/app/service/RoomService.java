package com.workspace.app.service;

import com.workspace.app.dto.CreateRoomRequest;
import com.workspace.app.model.Room;
import com.workspace.app.model.User;
import com.workspace.app.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import reactor.core.publisher.Mono;

/**
 * Service class for room management operations
 */
@Service
public class RoomService {
    
    @Autowired
    private RoomRepository roomRepository;
    
    @Autowired
    private UserService userService;
    
    /**
     * Create a new room
     */
    public Room createRoom(CreateRoomRequest request, String adminId) {
        // Verify admin user exists
        Optional<User> adminOptional = userService.getUserById(adminId);
        if (adminOptional.isEmpty()) {
            throw new RuntimeException("Admin user not found!");
        }
        
        // Check if room name already exists
        Optional<Room> existingRoom = roomRepository.findByNameAndIsActiveTrue(request.getName());
        if (existingRoom.isPresent()) {
            throw new RuntimeException("Room name already exists!");
        }
        
        // Create new room
        Room room = new Room();
        room.setName(request.getName());
        room.setDescription(request.getDescription());
        room.setAdminId(adminId);
        room.setPrivate(request.isPrivate());
        room.setMaxMembers(request.getMaxMembers());
        room.setVideoCallEnabled(request.isVideoCallEnabled());
        room.setMaxVideoParticipants(request.getMaxVideoParticipants());
        room.setCreatedAt(LocalDateTime.now());
        room.setActive(true);
        
        // Admin is automatically a member
        room.addMember(adminId);
        
        // Save room
        Room savedRoom = roomRepository.save(room);
        
        // Update user's admin rooms list
        userService.makeUserAdminOfRoom(adminId, savedRoom.getId());
        userService.addUserToRoom(adminId, savedRoom.getId());
        
        return savedRoom;
    }
    
    /**
     * Get room by ID
     */
    public Optional<Room> getRoomById(String roomId) {
        return roomRepository.findById(roomId);
    }
    
    /**
     * Get all active rooms
     */
    public List<Room> getAllActiveRooms() {
        return roomRepository.findByIsActiveTrueOrderByCreatedAtDesc();
    }
    
    /**
     * Get all rooms (for browsing - same as getAllActiveRooms for now)
     */
    public List<Room> getAllRooms() {
        return getAllActiveRooms();
    }
    
    /**
     * Get public rooms
     */
    public List<Room> getPublicRooms() {
        return roomRepository.findByIsPrivateFalseAndIsActiveTrueOrderByCreatedAtDesc();
    }
    
    /**
     * Get rooms where user is a member
     */
    public List<Room> getUserRooms(String userId) {
        return roomRepository.findByMembersContainingAndIsActiveTrueOrderByLastMessageAtDesc(userId);
    }
    
    /**
     * Get rooms where user is an admin
     */
    public List<Room> getUserAdminRooms(String userId) {
        return roomRepository.findByAdminIdAndIsActiveTrueOrderByCreatedAtDesc(userId);
    }
    
    /**
     * Join a room
     */
    public Room joinRoom(String roomId, String userId) {
        Optional<Room> roomOptional = roomRepository.findById(roomId);
        if (roomOptional.isEmpty()) {
            throw new RuntimeException("Room not found!");
        }
        
        Room room = roomOptional.get();
        
        if (!room.isActive()) {
            throw new RuntimeException("Room is not active!");
        }
        
        if (room.isMember(userId)) {
            throw new RuntimeException("User is already a member of this room!");
        }
        
        if (!room.canAddMember()) {
            throw new RuntimeException("Room is full!");
        }
        
        // Add user to room
        room.addMember(userId);
        Room savedRoom = roomRepository.save(room);
        
        // Update user's joined rooms list
        userService.addUserToRoom(userId, roomId);
        
        return savedRoom;
    }
    
    /**
     * Leave a room
     */
    public Room leaveRoom(String roomId, String userId) {
        Optional<Room> roomOptional = roomRepository.findById(roomId);
        if (roomOptional.isEmpty()) {
            throw new RuntimeException("Room not found!");
        }
        
        Room room = roomOptional.get();
        
        if (!room.isMember(userId)) {
            throw new RuntimeException("User is not a member of this room!");
        }
        
        if (room.isAdmin(userId)) {
            throw new RuntimeException("Admin cannot leave the room! Transfer admin rights first or delete the room.");
        }
        
        // Remove user from room
        room.removeMember(userId);
        Room savedRoom = roomRepository.save(room);
        
        // Update user's joined rooms list
        userService.removeUserFromRoom(userId, roomId);
        
        return savedRoom;
    }
    
    /**
     * Delete a room (only admin can delete)
     */
    public void deleteRoom(String roomId, String userId) {
        Optional<Room> roomOptional = roomRepository.findById(roomId);
        if (roomOptional.isEmpty()) {
            throw new RuntimeException("Room not found!");
        }
        
        Room room = roomOptional.get();
        
        if (!room.isAdmin(userId)) {
            throw new RuntimeException("Only room admin can delete the room!");
        }
        
        // Mark room as inactive instead of deleting
        room.setActive(false);
        roomRepository.save(room);
        
        // Remove room from all users' lists
        for (String memberId : room.getMembers()) {
            userService.removeUserFromRoom(memberId, roomId);
        }
        
        // Remove from admin's admin rooms list
        userService.removeUserAsAdminOfRoom(userId, roomId);
    }
    
    /**
     * Update room details (only admin can update)
     */
    public Room updateRoom(String roomId, String userId, Room updatedRoom) {
        Optional<Room> roomOptional = roomRepository.findById(roomId);
        if (roomOptional.isEmpty()) {
            throw new RuntimeException("Room not found!");
        }
        
        Room room = roomOptional.get();
        
        if (!room.isAdmin(userId)) {
            throw new RuntimeException("Only room admin can update the room!");
        }
        
        // Update allowed fields
        if (updatedRoom.getName() != null && !updatedRoom.getName().trim().isEmpty()) {
            // Check if new name already exists (exclude current room)
            Optional<Room> existingRoom = roomRepository.findByNameAndIsActiveTrue(updatedRoom.getName());
            if (existingRoom.isPresent() && !existingRoom.get().getId().equals(roomId)) {
                throw new RuntimeException("Room name already exists!");
            }
            room.setName(updatedRoom.getName());
        }
        
        if (updatedRoom.getDescription() != null) {
            room.setDescription(updatedRoom.getDescription());
        }
        
        if (updatedRoom.getMaxMembers() > 0) {
            room.setMaxMembers(updatedRoom.getMaxMembers());
        }
        
        room.setPrivate(updatedRoom.isPrivate());
        room.setAllowFileSharing(updatedRoom.isAllowFileSharing());
        room.setVideoCallEnabled(updatedRoom.isVideoCallEnabled());
        room.setMaxVideoParticipants(updatedRoom.getMaxVideoParticipants());
        
        return roomRepository.save(room);
    }
    
    /**
     * Attach VideoSDK room to an existing room
     */
    public Room attachVideoRoom(String roomId, String videoRoomId, String startedByUserId) {
        Optional<Room> roomOptional = roomRepository.findById(roomId);
        if (roomOptional.isEmpty()) {
            throw new RuntimeException("Room not found!");
        }
        
        Room room = roomOptional.get();
        
        // Create video metadata
        Room.VideoMeta videoMeta = new Room.VideoMeta("videosdk", videoRoomId);
        videoMeta.setLastStartedBy(startedByUserId);
        videoMeta.setLastStartedAt(java.time.Instant.now());
        
        room.setVideo(videoMeta);
        
        return roomRepository.save(room);
    }
    
    /**
     * End video call for a room
     */
    public Room endVideoCall(String roomId, String userId) {
        Optional<Room> roomOptional = roomRepository.findById(roomId);
        if (roomOptional.isEmpty()) {
            throw new RuntimeException("Room not found!");
        }
        
        Room room = roomOptional.get();
        
        if (!room.isAdmin(userId)) {
            throw new RuntimeException("Only room admin can end video call!");
        }
        
        if (room.getVideo() != null) {
            room.getVideo().setActive(false);
        }
        
        return roomRepository.save(room);
    }
    
    /**
     * Transfer admin rights to another user
     */
    public Room transferAdminRights(String roomId, String currentAdminId, String newAdminId) {
        Optional<Room> roomOptional = roomRepository.findById(roomId);
        if (roomOptional.isEmpty()) {
            throw new RuntimeException("Room not found!");
        }
        
        Room room = roomOptional.get();
        
        if (!room.isAdmin(currentAdminId)) {
            throw new RuntimeException("Only current admin can transfer admin rights!");
        }
        
        if (!room.isMember(newAdminId)) {
            throw new RuntimeException("New admin must be a member of the room!");
        }
        
        // Transfer admin rights
        room.setAdminId(newAdminId);
        Room savedRoom = roomRepository.save(room);
        
        // Update users' admin rooms lists
        userService.removeUserAsAdminOfRoom(currentAdminId, roomId);
        userService.makeUserAdminOfRoom(newAdminId, roomId);
        
        return savedRoom;
    }
    
    /**
     * Search rooms by name
     */
    public List<Room> searchRooms(String name) {
        return roomRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(name);
    }
    
    /**
     * Get popular rooms (by member count)
     */
    public List<Room> getPopularRooms() {
        return roomRepository.findPopularRooms();
    }
    
    /**
     * Check if user is admin of room
     */
    public boolean isUserAdminOfRoom(String userId, String roomId) {
        Optional<Room> roomOptional = roomRepository.findById(roomId);
        return roomOptional.isPresent() && roomOptional.get().isAdmin(userId);
    }
    
    /**
     * Check if user is member of room
     */
    public boolean isUserMemberOfRoom(String userId, String roomId) {
        Optional<Room> roomOptional = roomRepository.findById(roomId);
        return roomOptional.isPresent() && roomOptional.get().isMember(userId);
    }
    
    /**
     * Get room members
     */
    public List<String> getRoomMembers(String roomId) {
        Optional<Room> roomOptional = roomRepository.findById(roomId);
        if (roomOptional.isEmpty()) {
            throw new RuntimeException("Room not found!");
        }
        
        return roomOptional.get().getMembers();
    }
    
    /**
     * Update room's last message time
     */
    public void updateRoomLastMessageTime(String roomId) {
        Optional<Room> roomOptional = roomRepository.findById(roomId);
        if (roomOptional.isPresent()) {
            Room room = roomOptional.get();
            room.setLastMessageAt(LocalDateTime.now());
            roomRepository.save(room);
        }
    }
    
    /**
     * Initialize video call for room (placeholder for future video integration)
     */
    public String initializeVideoCall(String roomId, String userId) {
        Optional<Room> roomOptional = roomRepository.findById(roomId);
        if (roomOptional.isEmpty()) {
            throw new RuntimeException("Room not found!");
        }
        
        Room room = roomOptional.get();
        
        if (!room.isMember(userId)) {
            throw new RuntimeException("User is not a member of this room!");
        }
        
        if (!room.isVideoCallEnabled()) {
            throw new RuntimeException("Video calls are disabled for this room!");
        }
        
        // Initialize video call (placeholder)
        room.initializeVideoCall();
        roomRepository.save(room);
        
        return room.getVideoCallRoomId();
    }
    

    
    /**
     * Get all room IDs in a workspace (NEW METHOD FOR WORKSPACE INVITE FLOW)
     */
    public List<String> getAllRoomIdsInWorkspace(String workspaceId) {
        // For now, return all room IDs (workspace concept to be fully implemented)
        // This is a placeholder - in full implementation would filter by workspace
        return getAllActiveRooms().stream()
                .map(Room::getId)
                .toList();
    }
    
    /**
     * Add user to room (used by workspace invite system)
     */
    public void addUserToRoom(String roomId, String userId) {
        try {
            joinRoom(roomId, userId);
        } catch (RuntimeException e) {
            // User might already be a member, which is fine
            if (!e.getMessage().contains("already a member")) {
                throw e;
            }
        }
    }
}
