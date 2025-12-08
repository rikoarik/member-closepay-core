#!/bin/bash
# Closepay Core Manager - Linux/Mac Launcher
# This script runs the Python GUI application

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if Python is installed
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "Error: Python is not installed or not in PATH."
    echo "Please install Python 3.x and add it to your PATH."
    exit 1
fi

# Use python3 if available, otherwise use python
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
else
    PYTHON_CMD="python"
fi

# Run the application
echo "Starting Closepay Core Manager..."
echo ""
$PYTHON_CMD main.py

# Check exit status
if [ $? -ne 0 ]; then
    echo ""
    echo "An error occurred while running the application."
    exit 1
fi

