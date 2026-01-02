#!/bin/bash
# NotebookLM RAG - Start Frontend and Backend Servers
# Backend: Express server (port 3000)
# Frontend: Vite dev server (port 5173)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting NotebookLM RAG servers..."

# Start backend server in background
cd "$SCRIPT_DIR"
npm run dev &
BACKEND_PID=$!

# Start frontend server in background
cd "$SCRIPT_DIR/client"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Servers started:"
echo "  Backend:  http://localhost:3000 (PID: $BACKEND_PID)"
echo "  Frontend: http://localhost:5173 (PID: $FRONTEND_PID)"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes and handle Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
