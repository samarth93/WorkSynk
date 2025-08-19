package com.workspace.app.service;

import com.workspace.app.dto.MessageRequest;
import com.workspace.app.model.Message;
import com.workspace.app.model.Room;
import com.workspace.app.model.User;
import com.workspace.app.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for message management and chat operations
 */
@Service
public class MessageService {
    
    @Autowired
    private MessageRepository messageRepository;
    
    @Autowired
    private RoomService roomService;
    
    @Autowired
    private UserService userService;
    
    /**
     * Send a message to a room
     */
    public Message sendMessage(MessageRequest request, String senderId) {
        // Validate room exists and user is a member
        Optional<Room> roomOptional = roomService.getRoomById(request.getRoomId());
        if (roomOptional.isEmpty()) {
            throw new RuntimeException("Room not found!");
        }
        
        Room room = roomOptional.get();
        if (!room.isActive()) {
            throw new RuntimeException("Room is not active!");
        }
        
        if (!room.isMember(senderId)) {
            throw new RuntimeException("User is not a member of this room!");
        }
        
        // Get sender information
        Optional<User> senderOptional = userService.getUserById(senderId);
        if (senderOptional.isEmpty()) {
            throw new RuntimeException("Sender not found!");
        }
        
        User sender = senderOptional.get();
        
        // Create message
        Message message = new Message();
        message.setRoomId(request.getRoomId());
        message.setSenderId(senderId);
        message.setSenderUsername(sender.getUsername());
        message.setText(request.getText());
        message.setParentMessageId(request.getParentMessageId());
        message.setCreatedAt(LocalDateTime.now());
        message.setType(Message.MessageType.TEXT);
        
        // Save message
        Message savedMessage = messageRepository.save(message);
        
        // Update room's last message time
        roomService.updateRoomLastMessageTime(request.getRoomId());
        
        return savedMessage;
    }
    
    /**
     * Get messages for a room with pagination
     */
    public Page<Message> getRoomMessages(String roomId, int page, int size, String userId) {
        // Verify user is a member of the room
        if (!roomService.isUserMemberOfRoom(userId, roomId)) {
            throw new RuntimeException("User is not a member of this room!");
        }
        
        Pageable pageable = PageRequest.of(page, size);
        return messageRepository.findByRoomIdAndIsDeletedFalseOrderByCreatedAtDesc(roomId, pageable);
    }
    
    /**
     * Get recent messages for a room (last 50)
     */
    public List<Message> getRecentRoomMessages(String roomId, String userId) {
        // Verify user is a member of the room
        if (!roomService.isUserMemberOfRoom(userId, roomId)) {
            throw new RuntimeException("User is not a member of this room!");
        }
        
        return messageRepository.findTop50ByRoomIdAndIsDeletedFalseOrderByCreatedAtDesc(roomId);
    }
    
    /**
     * Get message by ID
     */
    public Optional<Message> getMessageById(String messageId) {
        return messageRepository.findById(messageId);
    }
    
    /**
     * Edit a message (only sender can edit)
     */
    public Message editMessage(String messageId, String newText, String userId) {
        Optional<Message> messageOptional = messageRepository.findById(messageId);
        if (messageOptional.isEmpty()) {
            throw new RuntimeException("Message not found!");
        }
        
        Message message = messageOptional.get();
        
        if (!message.getSenderId().equals(userId)) {
            throw new RuntimeException("Only the sender can edit this message!");
        }
        
        if (message.isDeleted()) {
            throw new RuntimeException("Cannot edit a deleted message!");
        }
        
        // Update message
        message.setText(newText);
        message.markAsEdited();
        
        return messageRepository.save(message);
    }
    
    /**
     * Delete a message (only sender or room admin can delete)
     */
    public Message deleteMessage(String messageId, String userId) {
        Optional<Message> messageOptional = messageRepository.findById(messageId);
        if (messageOptional.isEmpty()) {
            throw new RuntimeException("Message not found!");
        }
        
        Message message = messageOptional.get();
        
        // Check if user is the sender or room admin
        boolean canDelete = message.getSenderId().equals(userId) || 
                           roomService.isUserAdminOfRoom(userId, message.getRoomId());
        
        if (!canDelete) {
            throw new RuntimeException("You don't have permission to delete this message!");
        }
        
        if (message.isDeleted()) {
            throw new RuntimeException("Message is already deleted!");
        }
        
        // Mark message as deleted
        message.markAsDeleted();
        
        return messageRepository.save(message);
    }
    
    /**
     * Search messages in a room
     */
    public List<Message> searchMessages(String roomId, String searchText, String userId) {
        // Verify user is a member of the room
        if (!roomService.isUserMemberOfRoom(userId, roomId)) {
            throw new RuntimeException("User is not a member of this room!");
        }
        
        return messageRepository.findByRoomIdAndTextContainingIgnoreCaseAndIsDeletedFalse(roomId, searchText);
    }
    
    /**
     * Get threaded messages (replies to a parent message)
     */
    public List<Message> getThreadedMessages(String parentMessageId, String userId) {
        // Get parent message to verify user access
        Optional<Message> parentOptional = messageRepository.findById(parentMessageId);
        if (parentOptional.isEmpty()) {
            throw new RuntimeException("Parent message not found!");
        }
        
        Message parentMessage = parentOptional.get();
        
        // Verify user is a member of the room
        if (!roomService.isUserMemberOfRoom(userId, parentMessage.getRoomId())) {
            throw new RuntimeException("User is not a member of this room!");
        }
        
        return messageRepository.findByParentMessageIdAndIsDeletedFalseOrderByCreatedAtAsc(parentMessageId);
    }
    
    /**
     * Get user's messages in a room
     */
    public List<Message> getUserMessagesInRoom(String roomId, String userId) {
        // Verify user is a member of the room
        if (!roomService.isUserMemberOfRoom(userId, roomId)) {
            throw new RuntimeException("User is not a member of this room!");
        }
        
        return messageRepository.findBySenderIdAndIsDeletedFalseOrderByCreatedAtDesc(userId);
    }
    
    /**
     * Get message count for a room
     */
    public long getMessageCountForRoom(String roomId) {
        return messageRepository.countByRoomIdAndIsDeletedFalse(roomId);
    }
    
    /**
     * Get latest message in a room
     */
    public Optional<Message> getLatestMessageInRoom(String roomId) {
        Message latestMessage = messageRepository.findTopByRoomIdAndIsDeletedFalseOrderByCreatedAtDesc(roomId);
        return Optional.ofNullable(latestMessage);
    }
    
    /**
     * Send system message
     */
    public Message sendSystemMessage(String roomId, String text) {
        Optional<Room> roomOptional = roomService.getRoomById(roomId);
        if (roomOptional.isEmpty()) {
            throw new RuntimeException("Room not found!");
        }
        
        Message systemMessage = Message.createSystemMessage(roomId, text);
        
        // Save message
        Message savedMessage = messageRepository.save(systemMessage);
        
        // Update room's last message time
        roomService.updateRoomLastMessageTime(roomId);
        
        return savedMessage;
    }
    
    /**
     * Send video call start message (placeholder for future video integration)
     */
    public Message sendVideoCallStartMessage(String roomId, String senderId, String videoCallData) {
        // Validate room exists and user is a member
        Optional<Room> roomOptional = roomService.getRoomById(roomId);
        if (roomOptional.isEmpty()) {
            throw new RuntimeException("Room not found!");
        }
        
        Room room = roomOptional.get();
        if (!room.isMember(senderId)) {
            throw new RuntimeException("User is not a member of this room!");
        }
        
        // Get sender information
        Optional<User> senderOptional = userService.getUserById(senderId);
        if (senderOptional.isEmpty()) {
            throw new RuntimeException("Sender not found!");
        }
        
        User sender = senderOptional.get();
        
        // Create video call start message
        Message message = Message.createVideoCallStartMessage(roomId, senderId, sender.getUsername(), videoCallData);
        
        // Save message
        Message savedMessage = messageRepository.save(message);
        
        // Update room's last message time
        roomService.updateRoomLastMessageTime(roomId);
        
        return savedMessage;
    }
    
    /**
     * Send video call end message (placeholder for future video integration)
     */
    public Message sendVideoCallEndMessage(String roomId, String senderId, String videoCallData) {
        // Validate room exists and user is a member
        Optional<Room> roomOptional = roomService.getRoomById(roomId);
        if (roomOptional.isEmpty()) {
            throw new RuntimeException("Room not found!");
        }
        
        Room room = roomOptional.get();
        if (!room.isMember(senderId)) {
            throw new RuntimeException("User is not a member of this room!");
        }
        
        // Get sender information
        Optional<User> senderOptional = userService.getUserById(senderId);
        if (senderOptional.isEmpty()) {
            throw new RuntimeException("Sender not found!");
        }
        
        User sender = senderOptional.get();
        
        // Create video call end message
        Message message = Message.createVideoCallEndMessage(roomId, senderId, sender.getUsername(), videoCallData);
        
        // Save message
        Message savedMessage = messageRepository.save(message);
        
        // Update room's last message time
        roomService.updateRoomLastMessageTime(roomId);
        
        return savedMessage;
    }
    
    /**
     * Get video call messages for a room (placeholder for future video integration)
     */
    public List<Message> getVideoCallMessages(String roomId, String userId) {
        // Verify user is a member of the room
        if (!roomService.isUserMemberOfRoom(userId, roomId)) {
            throw new RuntimeException("User is not a member of this room!");
        }
        
        return messageRepository.findVideoCallMessages(roomId);
    }
    
    /**
     * Delete all messages in a room (for room cleanup)
     */
    public void deleteAllMessagesInRoom(String roomId, String adminId) {
        // Verify user is admin of the room
        if (!roomService.isUserAdminOfRoom(adminId, roomId)) {
            throw new RuntimeException("Only room admin can delete all messages!");
        }
        
        messageRepository.deleteByRoomId(roomId);
    }
}
