#!/bin/bash

# Build script for AI Research Assistant (Aria) - Zotero 7 Plugin
# This script installs dependencies and builds the plugin

set -e  # Exit on error

echo "=== Building AI Research Assistant for Zotero 7 ==="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install npm first."
    exit 1
fi

echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Install dependencies
echo ""
echo "=== Installing dependencies ==="
npm install

# Run the build
echo ""
echo "=== Building the plugin ==="
npm run build

echo ""
echo "=== Build complete! ==="
echo "The built plugin (.xpi file) should be in the 'build' directory."
echo "You can install it in Zotero 7 via Tools -> Add-ons -> Install Add-on From File"
