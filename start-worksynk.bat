@echo off
echo ====================================
echo    WorkSynk Application Launcher
echo ====================================
echo.

echo Checking if Docker is running...
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running or not installed!
    echo Please install Docker Desktop and make sure it's running.
    echo Download from: https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

echo Docker is running! Starting WorkSynk application...
echo.
echo This may take 5-10 minutes on first run...
echo.

docker-compose up --build

echo.
echo Application stopped. Press any key to exit...
pause >nul