#!/bin/bash
# NotebookLM RAG - Start Frontend and Backend Servers
# Backend: Express server (port 5175)
# Frontend: Vite dev server (port 5173)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to kill process on port
kill_port() {
  local port=$1
  local pid=$(lsof -ti :$port)
  if [ -n "$pid" ]; then
    echo "Killing process on port $port (PID: $pid)..."
    kill -9 $pid 2>/dev/null
  fi
}

echo "Stopping existing servers..."
kill_port 5175
kill_port 5173

echo "Starting NotebookLM RAG servers..."

cd "$SCRIPT_DIR"
npm install

cd "$SCRIPT_DIR/client"
npm install

# Start backend server in background
cd "$SCRIPT_DIR"
npm run dev &
BACKEND_PID=$!

cd "$SCRIPT_DIR/client"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Servers started:"
echo "  Backend:  http://localhost:5175 (PID: $BACKEND_PID)"
echo "  Frontend: http://localhost:5173 (PID: $FRONTEND_PID)"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes and handle Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
