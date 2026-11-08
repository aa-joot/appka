@echo off
REM QuizAnki Project Setup and Launch Script for Windows

echo.
echo ============================================
echo 🚀 QuizAnki - Language Learning Application
echo ============================================
echo.

REM Check Node.js
echo Checking Node.js installation...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js 16+
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do echo ✓ Node.js %%i

REM Check MongoDB
echo.
echo Checking MongoDB...
where mongod >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠ MongoDB not found locally
    echo Using MongoDB Atlas? Set MONGODB_URI in backend\.env
)

REM Install dependencies
echo.
echo Installing dependencies...
call npm install

REM Setup backend
echo.
echo Setting up backend...
if not exist "backend\.env" (
    copy backend\.env.example backend\.env
    echo ⚠ Created backend\.env - please configure MongoDB URI
)

echo.
echo ✓ Setup complete!
echo.
echo Next steps:
echo 1. Edit backend\.env with your MongoDB URI
echo 2. Start backend: cd backend ^&^& npm run dev
echo 3. Start frontend (new terminal): cd frontend ^&^& npm start
echo 4. Open browser: http://localhost:3000
echo.
echo Documentation:
echo - Quick Start: QUICK-START.md
echo - Full Setup: SETUP.md
echo - API Testing: QuizAnki-API.postman_collection.json
echo.
pause
