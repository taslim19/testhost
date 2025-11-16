#!/bin/bash

# Quick Setup Script for Debian 12
# This script sets up the environment and installs dependencies

set -e

echo "🔧 Setting up Telegram Hosting Bot on Debian 12..."

# Update system
echo "📦 Updating system packages..."
sudo apt update

# Install Node.js 20.x
if ! command -v node &> /dev/null; then
    echo "📥 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "✓ Node.js already installed: $(node --version)"
fi

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
    echo "📥 Installing PM2..."
    sudo npm install -g pm2
else
    echo "✓ PM2 already installed"
fi

# Install build tools (if needed)
echo "📥 Installing build essentials..."
sudo apt install -y build-essential

# Install Git (if not already installed)
if ! command -v git &> /dev/null; then
    echo "📥 Installing Git..."
    sudo apt install -y git
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure .env file with your credentials"
echo "2. Run: bash deploy.sh"
echo "   OR"
echo "3. Manual deployment:"
echo "   - npm install"
echo "   - npm run web:build"
echo "   - npm run build"
echo "   - pm2 start ecosystem.config.js"

