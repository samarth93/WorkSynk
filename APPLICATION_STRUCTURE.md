# WorkSynk Application File Structure

## Overview
WorkSynk is a modern workspace collaboration application built with a **Spring Boot backend** and **Next.js frontend**. The application follows a modular, microservices-inspired architecture with clear separation of concerns.

## Root Directory Structure

```
workspace-app/
├── README.md                                    # Project documentation
├── DATABASE_SCHEMA.md                           # Database schema documentation
├── FRONTEND_STRUCTURE_CLEANUP_COMPLETE.md      # Frontend cleanup report
├── .gitignore                                   # Git ignore rules
├── backend/                                     # Spring Boot backend application
└── frontend/                                    # Next.js frontend application
```

## Backend Structure (Spring Boot)

### Root Backend Directory
```
backend/
├── pom.xml                                      # Maven dependencies and build configuration
├── start-backend.sh                             # Backend startup script
├── SECURITY.md                                  # Security documentation
└── src/
    ├── main/
    │   ├── java/com/workspace/app/              # Java source code
    │   └── resources/
    │       └── application.yml                  # Spring Boot configuration
    └── test/java/                               # Test source code
```

### Java Package Structure
```
src/main/java/com/workspace/app/
├── WorkspaceAppApplication.java                 # Main Spring Boot application class
├── config/                                      # Configuration classes
│   ├── SecurityConfig.java                     # Spring Security configuration
│   └── WebSocketConfig.java                    # WebSocket configuration for real-time chat
├── controller/                                  # REST API controllers
│   ├── AdminController.java                    # Admin-specific endpoints
│   ├── AuthController.java                     # Authentication endpoints (login, register)
│   ├── ChatController.java                     # WebSocket chat handlers
│   ├── GlobalExceptionHandler.java             # Global error handling
│   ├── HealthController.java                   # Health check endpoints
│   ├── MessageController.java                  # Message-related endpoints
│   ├── RoomController.java                     # Room management endpoints
│   ├── SystemController.java                   # System information endpoints
│   ├── UserController.java                     # User management endpoints
│   └── VideoController.java                    # Video call integration endpoints
├── dto/                                         # Data Transfer Objects
│   ├── ApiResponse.java                        # Generic API response wrapper
│   ├── AuthResponse.java                       # Authentication response
│   ├── CreateRoomRequest.java                  # Room creation request
│   ├── InviteResponse.java                     # Workspace invite response
│   ├── InviteUserRequest.java                  # Workspace invite request
│   ├── LoginRequest.java                       # User login request
│   ├── MessageRequest.java                     # Message creation request
│   ├── RegisterRequest.java                    # User registration request
│   └── VerifyInviteRequest.java                # Invite verification request
├── model/                                       # MongoDB entity models
│   ├── User.java                               # User entity with profile information
│   ├── Room.java                               # Room entity with video integration
│   ├── Message.java                            # Message entity with attachments
│   ├── Workspace.java                          # Workspace entity
│   ├── WorkspaceMember.java                    # User-workspace relationship
│   └── WorkspaceInvite.java                    # Workspace invitation entity
├── repository/                                  # MongoDB repositories
│   ├── UserRepository.java                     # User data access
│   ├── RoomRepository.java                     # Room data access
│   ├── MessageRepository.java                  # Message data access
│   ├── WorkspaceRepository.java                # Workspace data access
│   ├── WorkspaceMemberRepository.java          # Workspace membership data access
│   └── WorkspaceInviteRepository.java          # Workspace invitation data access
└── service/                                     # Business logic services
    ├── UserService.java                        # User management business logic
    ├── RoomService.java                        # Room management business logic
    ├── MessageService.java                     # Message handling business logic
    ├── VideoSdkTokenService.java               # VideoSDK token generation
    └── VideoSdkRoomService.java                # VideoSDK room management
```

### Backend Configuration Files
- **`application.yml`**: Main configuration file containing:
  - MongoDB Atlas connection string
  - JWT secret and expiration settings
  - CORS configuration
  - VideoSDK API credentials
  - Server port and context path
  - Logging levels

## Frontend Structure (Next.js 15)

### Root Frontend Directory
```
frontend/
├── package.json                                 # NPM dependencies and scripts
├── package-lock.json                           # Dependency lock file
├── next.config.ts                              # Next.js configuration
├── tailwind.config.ts                          # Tailwind CSS configuration
├── tsconfig.json                               # TypeScript configuration
├── eslint.config.mjs                           # ESLint configuration
├── postcss.config.mjs                          # PostCSS configuration
├── start-frontend.sh                           # Frontend startup script
├── README.md                                   # Frontend-specific documentation
├── .gitignore                                  # Frontend-specific git ignore
├── public/                                     # Static assets
│   ├── next.svg                               # Next.js logo
│   └── favicon.ico                            # Application favicon
└── src/                                        # Source code
```

### Frontend Source Structure
```
src/
├── app/                                        # Next.js 15 App Router
│   ├── globals.css                            # Global styles (consolidated CSS)
│   ├── layout.tsx                             # Root layout component
│   ├── page.tsx                               # Home page
│   ├── favicon.ico                            # Application favicon
│   ├── auth/                                  # Authentication pages
│   │   ├── login/
│   │   │   └── page.tsx                       # Login page
│   │   ├── register/
│   │   │   └── page.tsx                       # Registration page
│   │   └── signup-options/
│   │       └── page.tsx                       # Signup options page
│   └── dashboard/                             # Protected dashboard pages
│       ├── page.tsx                           # Main dashboard
│       ├── admin/
│       │   └── page.tsx                       # Admin panel
│       ├── browse/
│       │   └── page.tsx                       # Browse rooms page
│       ├── create-room/
│       │   └── page.tsx                       # Room creation page
│       ├── profile/
│       │   └── page.tsx                       # User profile page
│       ├── rooms/
│       │   ├── page.tsx                       # Rooms list page
│       │   └── [roomId]/
│       │       ├── page.tsx                   # Individual room page
│       │       └── call/
│       │           ├── page.tsx               # Video call page
│       │           └── CallPanel.tsx          # Video call component
│       ├── settings/
│       │   └── page.tsx                       # User settings page
│       └── video/
│           └── page.tsx                       # Video calls overview page
├── components/                                # React components
│   ├── ClientOnly.tsx                         # Client-side rendering wrapper
│   ├── ErrorBoundary.tsx                      # Error boundary component
│   ├── NetworkStatus.tsx                      # Network connectivity indicator
│   ├── auth/                                  # Authentication components
│   │   ├── JoinWorkspaceFlow.tsx              # Workspace invitation flow
│   │   └── ProtectedRoute.tsx                 # Route protection wrapper
│   ├── chat/                                  # Chat-related components
│   │   ├── index.ts                           # Chat components export
│   │   ├── ChatInput.tsx                      # Chat message input
│   │   └── ChatMessage.tsx                    # Chat message display
│   ├── layout/                                # Layout components
│   │   ├── DashboardLayout.tsx                # Main dashboard layout
│   │   └── Navigation.tsx                     # Navigation sidebar
│   └── ui/                                    # UI components
│       ├── ThemeToggle.tsx                    # Dark/light mode toggle
│       └── ThemeToggleButton.tsx              # Theme toggle button
├── contexts/                                  # React contexts
│   ├── AuthContext.tsx                        # Authentication state management
│   └── ThemeContext.tsx                       # Theme state management
├── hooks/                                     # Custom React hooks
│   ├── index.ts                               # Hooks export file
│   └── useNetworkStatus.ts                   # Network status hook
├── lib/                                       # Utility libraries
│   ├── api.ts                                 # API client and endpoints
│   └── video.ts                               # VideoSDK integration utilities
├── types/                                     # TypeScript type definitions
│   └── index.ts                               # Application type definitions
└── utils/                                     # Utility functions
    ├── auth.ts                                # Authentication utilities
    └── theme/                                 # Theme utilities
        ├── index.ts                           # Theme utilities export
        ├── config.ts                          # Theme configuration
        ├── hooks.ts                           # Theme-related hooks
        └── components.tsx                     # Theme component wrappers
```

## Technology Stack

### Backend Technologies
- **Framework**: Spring Boot 3.x
- **Language**: Java 21
- **Database**: MongoDB Atlas (Cloud NoSQL)
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time Communication**: WebSocket (STOMP protocol)
- **Video Integration**: VideoSDK API
- **Security**: Spring Security 6.x
- **Build Tool**: Maven
- **Documentation**: Swagger/OpenAPI (implicit)

### Frontend Technologies
- **Framework**: Next.js 15.4.6 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS 3.4.0
- **State Management**: React Context API
- **HTTP Client**: Fetch API
- **Real-time**: WebSocket client
- **Video Calls**: VideoSDK React SDK
- **Build Tool**: Turbopack (Next.js 15)
- **Deployment**: Vercel-ready

## Configuration Files

### Backend Configuration (`application.yml`)
```yaml
server:
  port: 8080                                     # Server port
  servlet:
    context-path: /api                           # API base path

spring:
  data:
    mongodb:
      uri: mongodb+srv://...                     # MongoDB Atlas connection

jwt:
  secret: WorkspaceAppSecretKey...               # JWT signing key
  expiration: 86400000                           # Token expiration (24 hours)

videosdk:
  apiKey: 1616b563-d1e0-4b0b-8c7e-...          # VideoSDK API credentials
  secret: eb5df45a66c37d3e049582c31c83d755...   # VideoSDK secret
```

### Frontend Configuration
- **`next.config.ts`**: Next.js build and runtime configuration
- **`tailwind.config.ts`**: Tailwind CSS customization and dark mode setup
- **`tsconfig.json`**: TypeScript compiler options and path mapping
- **`package.json`**: Dependencies, scripts, and project metadata

## API Structure

### Authentication Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Token refresh

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/{id}` - Get user by ID

### Room Management
- `GET /api/rooms` - List user's rooms
- `POST /api/rooms` - Create new room
- `GET /api/rooms/{id}` - Get room details
- `POST /api/rooms/{id}/join` - Join room
- `DELETE /api/rooms/{id}/leave` - Leave room

### Message Operations
- `GET /api/rooms/{id}/messages` - Get room messages
- `POST /api/rooms/{id}/messages` - Send message
- WebSocket: `/ws/chat` - Real-time messaging

### Video Integration
- `POST /api/video/token` - Generate VideoSDK token
- `POST /api/rooms/{id}/video/start` - Start video session
- `POST /api/rooms/{id}/video/end` - End video session

### Admin Operations
- `GET /api/admin/users` - List all users
- `GET /api/admin/rooms` - List all rooms
- `GET /api/admin/stats` - System statistics

## Security Architecture

### Authentication Flow
1. **Login**: User credentials → JWT token
2. **Authorization**: JWT token → User context
3. **Protection**: Route guards on sensitive endpoints
4. **Refresh**: Token renewal mechanism

### Data Security
- **Password Hashing**: Bcrypt algorithm
- **JWT Security**: HS512 signing algorithm
- **CORS Protection**: Configured allowed origins
- **Input Validation**: Bean validation on all inputs

## Real-time Features

### WebSocket Implementation
- **Connection**: STOMP over WebSocket
- **Chat Messages**: Real-time message delivery
- **Room Updates**: Live room member changes
- **Typing Indicators**: User typing status
- **Connection Status**: Online/offline presence

### Video Integration
- **Provider**: VideoSDK
- **Features**: Multi-participant video calls
- **Token Management**: Server-side token generation
- **Room Lifecycle**: Automatic room creation/cleanup

## Deployment Architecture

### Development Environment
- **Backend**: `localhost:8080`
- **Frontend**: `localhost:3000`
- **Database**: MongoDB Atlas (cloud)
- **Cross-Origin**: Configured CORS for local development

### Production Considerations
- **Backend**: Docker containerization ready
- **Frontend**: Vercel deployment optimized
- **Database**: MongoDB Atlas production cluster
- **CDN**: Static assets via Vercel Edge Network
- **SSL/TLS**: Automatic certificate management

## Build and Deployment

### Backend Build
```bash
cd backend
mvn clean install                                # Build JAR file
java -jar target/workspace-app-backend.jar      # Run application
```

### Frontend Build
```bash
cd frontend
npm install                                      # Install dependencies
npm run build                                    # Production build
npm start                                        # Start production server
```

### Development Scripts
- **Backend**: `./backend/start-backend.sh`
- **Frontend**: `./frontend/start-frontend.sh`

## Monitoring and Logging

### Application Monitoring
- **Health Checks**: `/api/health` endpoint
- **System Info**: `/api/system/info` endpoint
- **Database Status**: MongoDB connection monitoring

### Logging Configuration
- **Spring Boot**: Configurable log levels
- **Request Logging**: HTTP request/response logging
- **Error Tracking**: Centralized exception handling
- **WebSocket Logging**: Connection and message logging

---

*Last Updated: August 31, 2025*
*Application Version: WorkSynk v1.0*
*Architecture: Microservices-inspired monolithic deployment*
