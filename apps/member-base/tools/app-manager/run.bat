@echo off
REM Closepay Core Manager - Windows Launcher
REM This script runs the Python GUI application

REM Get the directory where this script is located
cd /d "%~dp0"

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in PATH.
    echo Please install Python 3.x and add it to your PATH.
    pause
    exit /b 1
)

REM Run the application
echo Starting Closepay Core Manager...
echo.
python main.py

REM If there was an error, pause so user can see it
if errorlevel 1 (
    echo.
    echo An error occurred while running the application.
    pause
    exit /b 1
)

REM Close immediately after GUI closes
exit

