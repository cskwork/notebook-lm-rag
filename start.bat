@echo off
REM NotebookLM RAG - Start Frontend and Backend Servers
REM Backend: Express server (port 3000)
REM Frontend: Vite dev server (port 5173)

echo Starting NotebookLM RAG servers...

REM Start backend server in new window
start "Backend Server" cmd /k "cd /d %~dp0 && npm run dev"

REM Start frontend server in new window
start "Frontend Server" cmd /k "cd /d %~dp0\client && npm run dev"

echo.
echo Servers starting in separate windows:
echo   Backend:  http://localhost:3000
echo   Frontend: http://localhost:5173
echo.
