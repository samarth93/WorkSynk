package com.workspace.app.repository;

import com.workspace.app.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for User entity
 * Provides data access methods for user operations
 */
@Repository
public interface UserRepository extends MongoRepository<User, String> {
    
    /**
     * Find user by email
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Find user by username
     */
    Optional<User> findByUsername(String username);
    
    /**
     * Find user by email or username (for login)
     */
    @Query("{'$or': [{'email': ?0}, {'username': ?0}]}")
    Optional<User> findByEmailOrUsername(String emailOrUsername);
    
    /**
     * Check if email exists
     */
    boolean existsByEmail(String email);
    
    /**
     * Check if username exists
     */
    boolean existsByUsername(String username);
    
    /**
     * Find active users
     */
    List<User> findByIsActiveTrue();
    
    /**
     * Find users by partial username (for search)
     */
    @Query("{'username': {'$regex': ?0, '$options': 'i'}, 'isActive': true}")
    List<User> findByUsernameContainingIgnoreCaseAndIsActiveTrue(String username);
    
    /**
     * Find users who are members of a specific room
     */
    @Query("{'joinedRooms': ?0, 'isActive': true}")
    List<User> findByJoinedRoomsContainingAndIsActiveTrue(String roomId);
    
    /**
     * Find users who are admins of specific rooms
     */
    @Query("{'adminRooms': ?0, 'isActive': true}")
    List<User> findByAdminRoomsContainingAndIsActiveTrue(String roomId);
    
    /**
     * Find users with video call enabled (for future video integration)
     */
    List<User> findByVideoCallEnabledTrueAndIsActiveTrue();
}
