@echo off
REM Setup script for Member Base App
echo Setting up Member Base App...

REM Install dependencies
echo Installing dependencies...
call npm install

REM Link assets
echo Linking assets...
call npx react-native-asset

echo Setup complete! Run 'npm start' to start Metro bundler.
pause
