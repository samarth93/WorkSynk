#!/bin/bash

# Kill any existing Next.js processes
echo "Stopping any existing frontend processes..."
pkill -f "next dev" || true

# Wait a moment for processes to stop
sleep 2

# Start the frontend on port 3000
echo "Starting frontend on port 3000..."
npm run dev
