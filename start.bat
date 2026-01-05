@echo off
REM NotebookLM RAG - Start Frontend and Backend Servers
REM Backend: Express server (port 5175)
REM Frontend: Vite dev server (port 5173)

echo Checking for existing processes on ports 5175 and 5173...

REM Kill process on port 5175
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5175') do (
    if "%%a" neq "0" (
        echo Killing process %%a on port 5175
        taskkill /F /PID %%a >nul 2>&1
    )
)

REM Kill process on port 5173
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do (
    if "%%a" neq "0" (
        echo Killing process %%a on port 5173
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo Starting NotebookLM RAG servers...

REM Start backend server in new window
start "Backend Server" cmd /k "cd /d %~dp0 && npm run dev"

REM Start frontend server in new window
start "Frontend Server" cmd /k "cd /d %~dp0\client && npm run dev"

echo.
echo Servers starting in separate windows:
echo   Backend:  http://localhost:5175
echo   Frontend: http://localhost:5173
echo.
