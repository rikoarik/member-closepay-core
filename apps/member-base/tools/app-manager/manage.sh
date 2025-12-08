#!/bin/bash
# Closepay App Manager - Linux/Mac Shell Script
# Wrapper for app_manager.py

cd "$(dirname "$0")"
python app_manager.py "$@"

