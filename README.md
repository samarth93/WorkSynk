# WorkSynk - Collaborative Workspace Platform

A modern, full-stack workspace collaboration platform built with React, Next.js, Spring Boot, and MongoDB.

## 🚀 Features

- **Real-time Collaboration**: Chat, video calls, and live workspace updates
- **User Management**: Authentication, role-based access, and user profiles
- **Workspace Organization**: Create, manage, and organize collaborative rooms
- **Video Integration**: Built-in video calling with VideoSDK
- **Dark Mode**: Full dark/light theme support
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Admin Panel**: Administrative controls and user management

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

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:3000`

### Backend Setup
```bash
cd backend
mvn spring-boot:run
```
The backend API will be available at `http://localhost:8080`

### Environment Configuration
Create `.env.local` in the frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Configure `application.yml` in the backend resources directory with your MongoDB connection details.

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

### Styling
- Tailwind CSS for utility-first styling
- Custom theme system with dark mode
- Responsive design patterns
- Animation and transition utilities

## 📱 Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License
This project is licensed under the MIT License.

## 🔗 Links
- [Next.js Documentation](https://nextjs.org/docs)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
