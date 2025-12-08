#!/bin/bash
# Setup script for Member Base App
echo "Setting up Member Base App..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Link assets
echo "Linking assets..."
npx react-native-asset

# iOS setup (if on Mac)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Setting up iOS..."
    cd ios && pod install && cd ..
fi

echo "Setup complete! Run 'npm start' to start Metro bundler."
