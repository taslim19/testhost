#!/bin/bash

# Telegram Hosting Bot - Deployment Script for Debian 12
# Run with: bash deploy.sh

set -e

echo "🚀 Starting deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please do not run as root${NC}"
   exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js not found. Installing...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

echo -e "${GREEN}✓ Node.js version: $(node --version)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm version: $(npm --version)${NC}"

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${RED}⚠️  Please edit .env file with your configuration!${NC}"
    echo -e "${YELLOW}Press Enter to continue after editing .env...${NC}"
    read
fi

# Build frontend
echo -e "${YELLOW}Building frontend...${NC}"
npm run web:build

# Build backend
echo -e "${YELLOW}Building backend...${NC}"
npm run build

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}PM2 not found. Installing...${NC}"
    sudo npm install -g pm2
fi

# Create logs directory
mkdir -p logs

# Start with PM2
echo -e "${YELLOW}Starting application with PM2...${NC}"
pm2 start ecosystem.config.js
pm2 save

echo -e "${GREEN}✓ Deployment complete!${NC}"
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "  pm2 status          - Check status"
echo -e "  pm2 logs            - View logs"
echo -e "  pm2 restart hosting-bot - Restart bot"
echo -e "  pm2 stop hosting-bot    - Stop bot"

