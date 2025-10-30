@echo off
echo ========================================
echo Light Video Downloader - Setup
echo ========================================
echo.

echo [1/3] Checking prerequisites...
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

where cargo >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Rust is not installed!
    echo Please install Rust from https://rustup.rs/
    pause
    exit /b 1
)

echo ✓ Node.js installed
echo ✓ Rust installed
echo.

echo [2/3] Installing dependencies...
cd ui
call npm install

echo.
echo [3/3] Setup complete!
echo.
echo ========================================
echo To start the app in development mode:
echo   cd ui
echo   npm run tauri:dev
echo.
echo To build for production:
echo   cd ui
echo   npm run tauri:build
echo ========================================
echo.
pause
