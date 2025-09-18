# WorkSynk - Docker Setup Guide for Windows

This guide will help you quickly run the WorkSynk application on Windows using Docker.

## Prerequisites

1. **Install Docker Desktop for Windows**
   - Download from: https://www.docker.com/products/docker-desktop/
   - Install and start Docker Desktop
   - Make sure Docker is running (you'll see the Docker icon in the system tray)

## Quick Start

1. **Download/Clone the WorkSynk project**
   - Extract the files to a folder (e.g., `C:\WorkSynk`)

2. **Open Command Prompt or PowerShell**
   - Press `Win + R`, type `cmd`, and press Enter
   - Or press `Win + X` and select "Windows PowerShell"

3. **Navigate to the project folder**
   ```cmd
   cd C:\WorkSynk
   ```

4. **Start the application**
   ```cmd
   docker-compose up --build
   ```

5. **Wait for the build to complete**
   - The first time will take 5-10 minutes as it downloads and builds everything
   - You'll see messages about building the backend and frontend
   - Wait until you see "frontend-1" and "backend-1" are running

6. **Access the application**
   - Open your web browser
   - Go to: http://localhost:3000
   - Login with: **Username:** `admin` **Password:** `password`

## Stopping the Application

To stop the application:
```cmd
docker-compose down
```

## Restarting the Application

To start again (much faster after first build):
```cmd
docker-compose up
```

## Troubleshooting

### If port 3000 or 8080 is already in use:
- Stop any other applications using these ports
- Or modify the ports in `docker-compose.yml`

### If Docker build fails:
- Make sure Docker Desktop is running
- Try: `docker-compose down` then `docker-compose up --build` again

### If you can't access the application:
- Make sure both containers are running: `docker-compose ps`
- Check if ports are accessible: try http://localhost:8080/api/health

## What's Running

- **Frontend (Next.js)**: http://localhost:3000 - The main application interface
- **Backend (Spring Boot)**: http://localhost:8080 - API server
- **Database**: MongoDB Atlas (cloud) - Already configured

## Features Available

- ✅ User authentication and registration
- ✅ Real-time chat functionality
- ✅ Video calling capabilities
- ✅ Workspace management
- ✅ Admin panel access
- ✅ Room creation and management

## Default Admin Account

- **Username**: `admin`
- **Password**: `password`

You can create additional users through the registration page or admin panel.

---

**Need Help?** The application should work out of the box with these Docker files. If you encounter any issues, make sure Docker Desktop is running and try the troubleshooting steps above.