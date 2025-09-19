#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Starting Workspace App Backend..."
echo "=================================="
echo "📂 Working directory: $SCRIPT_DIR"

# Kill any existing processes on port 8080
echo "🔧 Checking for existing processes on port 8080..."
lsof -t -i:8080 | xargs -r kill -9 2>/dev/null

# Clean and compile
echo "🏗️  Cleaning and compiling..."
mvn clean compile -q

if [ $? -eq 0 ]; then
    echo "✅ Compilation successful!"
else
    echo "❌ Compilation failed!"
    exit 1
fi

# Start the application
echo "🚀 Starting Spring Boot application..."
echo "📊 MongoDB URI: configured"
echo "🔐 JWT: enabled"
echo "💬 WebSocket: enabled"
echo "📹 Video calls: placeholder ready"
echo ""
echo "Starting server on http://localhost:8080/api"
echo "Press Ctrl+C to stop..."
echo ""

mvn spring-boot:run
