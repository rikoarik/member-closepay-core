@echo off
REM Closepay App Manager - Windows Batch Script
REM Wrapper for app_manager.py

cd /d "%~dp0"

REM If no arguments provided, show help and pause
if "%~1"=="" (
    echo.
    echo ========================================
    echo  Closepay App Manager
    echo ========================================
    echo.
    echo Quick Commands:
    echo   manage.bat generate {tenant_id} --output {path}
    echo   manage.bat list
    echo   manage.bat status
    echo   manage.bat sync {tenant_id}
    echo.
    echo Examples:
    echo   manage.bat generate member-base --output D:\MyApps
    echo   manage.bat generate DEFAULT --output D:\MyApps --folder my-app
    echo.
    echo.
    python app_manager.py --help
    echo.
    pause
    exit
)

REM Run command
python app_manager.py %*

REM Pause if there was an error
if errorlevel 1 (
    echo.
    echo Command failed. Press any key to exit...
    pause >nul
)
exit

