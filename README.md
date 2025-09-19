# WorkSynk - Collaborative Workspace Platform

A modern, full-stack workspace collaboration platform built with React, Next.js, Spring Boot, and MongoDB. WorkSynk provides seamless real-time communication, video conferencing, and workspace management capabilities for teams and organizations.

## 🚀 Features

- **Real-time Collaboration**: Chat, video calls, and live workspace updates
- **User Management**: JWT-based authentication with role-based access control
- **Workspace Organization**: Create, manage, and organize collaborative rooms
- **Video Integration**: Built-in video calling with VideoSDK (up to 10 participants)
- **Dark Mode**: Full dark/light theme support with system preference detection
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Admin Panel**: Administrative controls and user management
- **Multi-workspace Support**: Users can belong to multiple workspaces
- **Invitation System**: Email-based workspace invitations with expiration
- **WebSocket Integration**: Real-time messaging and live updates

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

### Backend
- **Spring Boot** - Java web framework
- **MongoDB Atlas** - Cloud database
- **JWT** - Authentication
- **WebSocket** - Real-time communication
- **Maven** - Build tool

## 📦 Project Structure

```
workspace-app/
├── frontend/           # Next.js React application
│   ├── src/
│   │   ├── app/        # Next.js app router pages
│   │   ├── components/ # Reusable React components
│   │   ├── contexts/   # React contexts
│   │   ├── hooks/      # Custom React hooks
│   │   ├── lib/        # Utility libraries
│   │   ├── types/      # TypeScript type definitions
│   │   └── utils/      # Utility functions
│   └── public/         # Static assets
├── backend/            # Spring Boot application
│   └── src/
│       ├── main/java/  # Java source code
│       └── resources/  # Configuration files
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Java 17+
- Maven 3.6+
- MongoDB Atlas account

### Quick Start (Recommended)
```bash
# Start Backend
cd backend
chmod +x start-backend.sh
./start-backend.sh

# Start Frontend (in a new terminal)
cd frontend
chmod +x start-frontend.sh
./start-frontend.sh
```

### Manual Setup

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:3000`

#### Backend Setup
```bash
cd backend
mvn spring-boot:run
```
The backend API will be available at `http://localhost:8080/api`

### Environment Configuration
The application automatically creates `.env.local` in the frontend directory with the correct API configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_API_BASE=http://localhost:8080/api
```

The backend is pre-configured with MongoDB Atlas connection. No additional setup required for development.

## 🎨 Key Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (User, Admin)
- Protected routes and API endpoints

### Real-time Communication
- WebSocket integration for live updates
- Video calling with VideoSDK
- Real-time chat messaging

### Modern UI/UX
- Responsive design for all devices
- Dark/light theme switching
- Interactive animations and transitions
- Accessible components

### Workspace Management
- Create and manage collaborative rooms
- User invitations and memberships
- File sharing and organization

## 🔧 Development

### Code Quality
- ESLint and Prettier for code formatting
- TypeScript for type safety
- Component-based architecture
- Custom hooks and utilities
- Comprehensive error handling and validation

### Styling
- Tailwind CSS for utility-first styling
- Custom theme system with dark mode
- Responsive design patterns
- Animation and transition utilities

### API Architecture
- RESTful API design with Spring Boot
- WebSocket integration for real-time features
- JWT-based authentication and authorization
- CORS configuration for cross-origin requests
- API proxy configuration in Next.js

### Database
- MongoDB Atlas cloud database
- 6 main collections: users, rooms, messages, workspaces, workspace_members, workspace_invites
- Optimized indexing for performance
- Data validation and integrity checks

## 🧪 Testing

### API Testing
All major API endpoints have been tested and verified:
- ✅ Authentication APIs (login, register)
- ✅ User Management APIs (profile, updates)
- ✅ Room Management APIs (create, join, leave)
- ✅ Message APIs (send, retrieve, pagination)
- ✅ Video Integration APIs (token generation)
- ✅ System APIs (health check, system info)

### Test Credentials
The application includes test accounts for development:
- **Admin User**: `palsamarth9@gmail.com` / `Sama.1234`
- **Regular User**: `samarthdev.io@gmail.com` / `Arun.1234`

### Application URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **API Proxy**: http://localhost:3000/api/* → http://localhost:8080/api/*

## 🚀 Deployment

### Docker Support
The application includes Docker configuration for easy deployment:
```bash
docker-compose up --build
```

### Production Considerations
- Environment variables for production configuration
- MongoDB Atlas production cluster
- SSL/TLS certificate management
- CDN for static assets

## 📱 Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes thoroughly
5. Submit a pull request

## 📄 License
This project is licensed under the MIT License.

## 🔗 Links
- [Next.js Documentation](https://nextjs.org/docs)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [VideoSDK Documentation](https://docs.videosdk.live/)

## 📝 Recent Updates

### v1.0.0 (Latest)
- ✅ Fixed frontend-backend API connectivity issues
- ✅ Implemented API proxy configuration in Next.js
- ✅ Added comprehensive environment configuration
- ✅ Enhanced error handling and validation
- ✅ Improved startup scripts for easy development
- ✅ Added comprehensive API testing and verification
- ✅ Optimized CORS configuration for cross-origin requests
- ✅ Enhanced documentation and setup instructions
