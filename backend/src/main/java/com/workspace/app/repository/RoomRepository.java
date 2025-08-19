package com.workspace.app.repository;

import com.workspace.app.model.Room;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Room entity
 * Provides data access methods for room operations
 */
@Repository
public interface RoomRepository extends MongoRepository<Room, String> {
    
    /**
     * Find active rooms
     */
    List<Room> findByIsActiveTrueOrderByCreatedAtDesc();
    
    /**
     * Find rooms by admin ID
     */
    List<Room> findByAdminIdAndIsActiveTrueOrderByCreatedAtDesc(String adminId);
    
    /**
     * Find rooms where user is a member
     */
    @Query("{'members': ?0, 'isActive': true}")
    List<Room> findByMembersContainingAndIsActiveTrueOrderByLastMessageAtDesc(String userId);
    
    /**
     * Find public rooms (not private)
     */
    List<Room> findByIsPrivateFalseAndIsActiveTrueOrderByCreatedAtDesc();
    
    /**
     * Find rooms by name (case insensitive search)
     */
    @Query("{'name': {'$regex': ?0, '$options': 'i'}, 'isActive': true}")
    List<Room> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);
    
    /**
     * Find room by exact name
     */
    Optional<Room> findByNameAndIsActiveTrue(String name);
    
    /**
     * Count rooms created by user
     */
    long countByAdminIdAndIsActiveTrue(String adminId);
    
    /**
     * Find rooms with video call enabled (for future video integration)
     */
    List<Room> findByVideoCallEnabledTrueAndIsActiveTrueOrderByCreatedAtDesc();
    
    /**
     * Find rooms by member count (for analytics)
     */
    @Query("{'$expr': {'$gte': [{'$size': '$members'}, ?0]}, 'isActive': true}")
    List<Room> findRoomsWithMinimumMembers(int minMembers);
    
    /**
     * Find popular rooms (with most members)
     */
    @Query(value = "{'isPrivate': false, 'isActive': true}", sort = "{'members': -1}")
    List<Room> findPopularRooms();
}
