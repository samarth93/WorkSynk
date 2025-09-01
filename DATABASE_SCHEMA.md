# Database Schema Documentation

## Overview
The WorkSynk application uses **MongoDB Atlas** as its primary database, leveraging the flexibility of a NoSQL document database. The database is hosted on MongoDB Cloud with automatic scaling and high availability.

## Database Configuration
- **Database Name**: `workspace-app`
- **Host**: MongoDB Atlas Cloud (Cluster0)
- **Connection String**: MongoDB+srv URI with connection pooling
- **Collections**: 6 main collections

## Collections Schema

### 1. Users Collection (`users`)

**Purpose**: Stores user account information, authentication data, and profile details.

```javascript
{
  _id: ObjectId("..."),                          // MongoDB unique identifier
  username: "john_doe",                          // Unique username (3-20 chars)
  email: "john.doe@example.com",                 // Unique email address
  passwordHash: "...",                           // Bcrypt hashed password
  firstName: "John",                             // User's first name
  lastName: "Doe",                               // User's last name
  profilePictureUrl: "https://...",              // Profile picture URL (optional)
  designation: "Software Engineer",              // Job title/designation
  role: "user",                                  // User role (user/admin)
  bio: "Full-stack developer...",                // User bio/description
  status: "online",                              // Current status (online, offline, vacation, medical_leave, busy, away)
  joinedRooms: ["room_id_1", "room_id_2"],      // Array of room IDs user belongs to
  adminRooms: ["room_id_3"],                    // Array of room IDs user administers
  currentWorkspaceId: "workspace_id",           // Currently active workspace
  workspaceIds: ["workspace_id_1", "workspace_id_2"], // All workspaces user belongs to
  createdAt: ISODate("2025-01-01T00:00:00Z"),   // Account creation timestamp
  lastLoginAt: ISODate("2025-01-15T10:30:00Z"), // Last login timestamp
  isActive: true,                                // Account status
  videoCallEnabled: true,                        // Video call feature enabled
  videoCallUserPreferences: "{...}"             // JSON string for video settings
}
```

**Indexes**:
- `username` (unique)
- `email` (unique)

### 2. Rooms Collection (`rooms`)

**Purpose**: Represents chat rooms/workspaces where users collaborate and communicate.

```javascript
{
  _id: ObjectId("..."),                          // MongoDB unique identifier
  name: "Project Alpha Team",                    // Room name (3-50 chars)
  description: "Main discussion room for...",    // Room description (max 500 chars)
  adminId: "user_id_of_admin",                   // Room creator/administrator user ID
  members: ["user_id_1", "user_id_2", "..."],   // Array of member user IDs
  createdAt: ISODate("2025-01-01T00:00:00Z"),   // Room creation timestamp
  lastMessageAt: ISODate("2025-01-15T14:20:00Z"), // Timestamp of last message
  isActive: true,                                // Room status
  isPrivate: false,                              // Privacy setting (future use)
  maxMembers: 100,                               // Maximum allowed members
  allowFileSharing: true,                        // File sharing permission
  videoCallEnabled: true,                        // Video call feature enabled
  videoCallRoomId: "videosdk_room_id",          // External video service room ID
  maxVideoParticipants: 10,                     // Max participants in video calls
  video: {                                       // Video integration metadata
    provider: "videosdk",                        // Video service provider
    videoRoomId: "videosdk_meeting_id",         // Provider-specific room ID
    active: true,                               // Video session status
    lastStartedBy: "user_id",                   // Who started last session
    lastStartedAt: ISODate("2025-01-15T14:00:00Z") // When last session started
  }
}
```

**Indexes**:
- `adminId`
- `members` (multikey index for array field)

### 3. Messages Collection (`messages`)

**Purpose**: Stores all chat messages exchanged within rooms.

```javascript
{
  _id: ObjectId("..."),                          // MongoDB unique identifier
  roomId: "room_id",                            // Associated room ID
  senderId: "user_id",                          // Message sender user ID
  senderUsername: "john_doe",                    // Cached sender username for performance
  text: "Hello everyone!",                       // Message content (max 2000 chars)
  createdAt: ISODate("2025-01-15T14:25:00Z"),   // Message creation timestamp
  editedAt: ISODate("2025-01-15T14:26:00Z"),    // Last edit timestamp (optional)
  isEdited: false,                              // Whether message was edited
  isDeleted: false,                             // Whether message was deleted
  type: "TEXT",                                 // Message type (TEXT, IMAGE, FILE, VIDEO_CALL_START, VIDEO_CALL_END, SYSTEM)
  attachmentUrl: "https://...",                  // File attachment URL (optional)
  attachmentName: "document.pdf",               // Original filename (optional)
  attachmentType: "application/pdf",            // MIME type (optional)
  attachmentSize: 1024576,                      // File size in bytes (optional)
  reactions: "{...}",                           // JSON string for emoji reactions (future)
  parentMessageId: "message_id",                // For threaded conversations (future)
  replyCount: 0,                                // Number of replies (future)
  videoCallData: "{...}"                        // JSON for video call session data (future)
}
```

**Indexes**:
- `roomId`
- `senderId`
- `createdAt` (descending for recent messages)

### 4. Workspaces Collection (`workspaces`)

**Purpose**: Represents organizational workspaces that contain multiple rooms and users.

```javascript
{
  _id: ObjectId("..."),                          // MongoDB unique identifier
  name: "Acme Corporation",                      // Workspace name
  description: "Main corporate workspace",       // Workspace description
  adminId: "user_id_of_admin",                   // Primary administrator user ID
  createdAt: ISODate("2025-01-01T00:00:00Z"),   // Workspace creation timestamp
  active: true,                                  // Workspace status
  inviteCode: "ABC123",                         // Optional invite code for easy joining
  settings: ["setting1", "setting2"]            // Workspace-specific configuration
}
```

**Indexes**:
- `name`
- `adminId`

### 5. Workspace Members Collection (`workspace_members`)

**Purpose**: Junction collection linking users to workspaces with specific roles.

```javascript
{
  _id: ObjectId("..."),                          // MongoDB unique identifier
  workspaceId: "workspace_id",                   // Associated workspace ID
  userId: "user_id",                             // Associated user ID
  role: "member",                                // User role in workspace (admin, member)
  joinedAt: ISODate("2025-01-01T00:00:00Z"),    // When user joined workspace
  active: true                                   // Membership status
}
```

**Indexes**:
- `workspaceId`
- `userId`
- Compound index: `{workspaceId: 1, userId: 1}` (unique)

### 6. Workspace Invites Collection (`workspace_invites`)

**Purpose**: Manages email invitations for joining workspaces.

```javascript
{
  _id: ObjectId("..."),                          // MongoDB unique identifier
  workspaceId: "workspace_id",                   // Target workspace ID
  email: "newuser@example.com",                  // Invitee email address
  invitedBy: "admin_user_id",                    // Admin who sent the invitation
  invitedAt: ISODate("2025-01-15T10:00:00Z"),   // When invitation was sent
  expiresAt: ISODate("2025-01-22T10:00:00Z"),   // Expiration date (7 days default)
  used: false,                                   // Whether invitation has been used
  status: "pending",                             // Status (pending, accepted, expired, cancelled)
  usedAt: ISODate("2025-01-16T09:00:00Z")       // When invitation was used (optional)
}
```

**Indexes**:
- `workspaceId`
- `email`
- `expiresAt` (for cleanup of expired invites)

## Relationships

### User-Room Relationships
- **Many-to-Many**: Users can belong to multiple rooms, rooms can have multiple users
- **Implementation**: User document stores `joinedRooms` array, Room document stores `members` array
- **Admin Relationship**: User document stores `adminRooms` array, Room document has `adminId` field

### User-Workspace Relationships
- **Many-to-Many**: Users can belong to multiple workspaces, workspaces can have multiple users
- **Implementation**: Through `workspace_members` junction collection
- **Roles**: Defined in the junction collection (admin, member)

### Workspace-Room Relationships
- **One-to-Many**: Each workspace can contain multiple rooms (not directly implemented in current schema)
- **Future Enhancement**: Room document could include `workspaceId` field

### Message-Room-User Relationships
- **Many-to-One**: Multiple messages belong to one room and one user
- **Implementation**: Message document stores `roomId` and `senderId`

## Data Integrity

### Validation Rules
1. **Username**: 3-20 characters, unique
2. **Email**: Valid email format, unique
3. **Room Name**: 3-50 characters, required
4. **Message Text**: Max 2000 characters, required
5. **Workspace-User**: Unique combination via compound index

### Referential Integrity
- **Soft References**: All relationships use string IDs rather than MongoDB references
- **Cleanup Strategy**: Application-level cleanup for orphaned records
- **Cascade Deletes**: Handled at application level

## Indexing Strategy

### Performance Indexes
1. **User Lookups**: `email` and `username` unique indexes
2. **Room Queries**: `adminId` and `members` indexes
3. **Message Retrieval**: `roomId` and `createdAt` descending
4. **Workspace Operations**: `adminId` and compound `{workspaceId, userId}`

### Query Patterns
- **Recent Messages**: Sort by `createdAt` descending with `roomId` filter
- **User Rooms**: Query rooms where `members` contains user ID
- **Workspace Members**: Query by `workspaceId` in workspace_members collection

## Security Considerations

### Data Protection
1. **Password Storage**: Bcrypt hashed, never stored in plain text
2. **Sensitive Data**: Email addresses are indexed but protected
3. **User Privacy**: Profile information controlled by user settings

### Access Control
1. **Room Access**: Controlled via `members` array
2. **Admin Functions**: Validated against `adminId` and `adminRooms`
3. **Workspace Permissions**: Enforced through `workspace_members` roles

## Database Statistics

### Estimated Document Sizes
- **User**: ~1-2KB per document
- **Room**: ~0.5-1KB per document
- **Message**: ~0.2-0.5KB per document
- **Workspace**: ~0.3-0.5KB per document
- **Workspace Members**: ~0.1KB per document
- **Workspace Invites**: ~0.2KB per document

### Scaling Considerations
- **Message Volume**: Highest growth potential
- **User Growth**: Linear scaling with organization size
- **Room Scaling**: Moderate growth based on team structure
- **Indexing**: Regular monitoring of query performance

## Backup and Maintenance

### MongoDB Atlas Features
- **Automated Backups**: Daily snapshots
- **Point-in-Time Recovery**: Available
- **Monitoring**: Built-in performance monitoring
- **Scaling**: Automatic based on load

### Maintenance Tasks
1. **Index Optimization**: Monitor slow queries
2. **Data Archival**: Old messages and inactive workspaces
3. **User Cleanup**: Remove inactive user accounts
4. **Invite Cleanup**: Remove expired invitations

---

*Last Updated: August 31, 2025*
*Database Version: MongoDB 7.x*
*Application: WorkSynk v1.0*
