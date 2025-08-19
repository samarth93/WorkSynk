package com.workspace.app.repository;

import com.workspace.app.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for Message entity
 * Provides data access methods for message operations
 */
@Repository
public interface MessageRepository extends MongoRepository<Message, String> {
    
    /**
     * Find messages by room ID with pagination
     */
    Page<Message> findByRoomIdAndIsDeletedFalseOrderByCreatedAtDesc(String roomId, Pageable pageable);
    
    /**
     * Find recent messages by room ID
     */
    List<Message> findTop50ByRoomIdAndIsDeletedFalseOrderByCreatedAtDesc(String roomId);
    
    /**
     * Find messages by sender ID
     */
    List<Message> findBySenderIdAndIsDeletedFalseOrderByCreatedAtDesc(String senderId);
    
    /**
     * Find messages by room and date range
     */
    List<Message> findByRoomIdAndCreatedAtBetweenAndIsDeletedFalseOrderByCreatedAtAsc(
            String roomId, LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Count messages in a room
     */
    long countByRoomIdAndIsDeletedFalse(String roomId);
    
    /**
     * Count messages by user in a room
     */
    long countByRoomIdAndSenderIdAndIsDeletedFalse(String roomId, String senderId);
    
    /**
     * Find messages containing text (search)
     */
    @Query("{'roomId': ?0, 'text': {'$regex': ?1, '$options': 'i'}, 'isDeleted': false}")
    List<Message> findByRoomIdAndTextContainingIgnoreCaseAndIsDeletedFalse(String roomId, String text);
    
    /**
     * Find threaded messages (replies to a parent message)
     */
    List<Message> findByParentMessageIdAndIsDeletedFalseOrderByCreatedAtAsc(String parentMessageId);
    
    /**
     * Find latest message in a room
     */
    Message findTopByRoomIdAndIsDeletedFalseOrderByCreatedAtDesc(String roomId);
    
    /**
     * Find messages by type (for video call messages, system messages, etc.)
     */
    List<Message> findByRoomIdAndTypeAndIsDeletedFalseOrderByCreatedAtDesc(String roomId, Message.MessageType type);
    
    /**
     * Find messages with attachments
     */
    @Query("{'roomId': ?0, 'attachmentUrl': {'$ne': null}, 'isDeleted': false}")
    List<Message> findByRoomIdAndAttachmentUrlIsNotNullAndIsDeletedFalse(String roomId);
    
    /**
     * Delete all messages in a room (for room cleanup)
     */
    void deleteByRoomId(String roomId);
    
    /**
     * Find video call related messages (for future video integration)
     */
    @Query("{'roomId': ?0, 'type': {'$in': ['VIDEO_CALL_START', 'VIDEO_CALL_END']}, 'isDeleted': false}")
    List<Message> findVideoCallMessages(String roomId);
}
