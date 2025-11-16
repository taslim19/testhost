# 🚀 Deployment Guide for Debian 12

This guide will help you deploy the Telegram GitHub Deployment Bot on your Debian 12 local machine.

## 📋 Prerequisites

- Debian 12 (Bookworm)
- Root or sudo access
- Internet connection
- Domain name or public IP (for Telegram Web App)

## 🔧 Step 1: Install Node.js and npm

```bash
# Update package list
sudo apt update

# Install Node.js 18+ (using NodeSource repository)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

## 📦 Step 2: Clone and Setup Project

```bash
# Navigate to your desired directory
cd /opt  # or wherever you prefer

# Clone the repository
git clone https://github.com/taslim19/testhost.git
cd testhost

# Install dependencies
npm install
```

## ⚙️ Step 3: Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit the .env file
nano .env
```

Fill in your configuration:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_WEB_APP_URL=http://your-ip-or-domain:3000

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://your-ip-or-domain:3000/auth/github/callback

# Server Configuration
PORT=3000
NODE_ENV=production

# Deployment Platform API Keys (optional)
VERCEL_TOKEN=your_vercel_token
NETLIFY_TOKEN=your_netlify_token
RAILWAY_TOKEN=your_railway_token

# Session Secret (generate with: openssl rand -hex 32)
SESSION_SECRET=your_random_session_secret_here
```

**Important Notes:**
- Replace `your-ip-or-domain` with your actual IP address or domain
- For local testing, you can use `http://localhost:3000` but Telegram Web App requires HTTPS or a public URL
- Generate SESSION_SECRET: `openssl rand -hex 32`

## 🏗️ Step 4: Build the Project

```bash
# Build the frontend
npm run web:build

# Build the backend
npm run build
```

## 🚀 Step 5: Run with PM2 (Recommended for Production)

### Install PM2

```bash
sudo npm install -g pm2
```

### Create PM2 Ecosystem File

Create `ecosystem.config.js` (already included in project):

```bash
# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions it provides
```

### PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs

# Restart
pm2 restart hosting-bot

# Stop
pm2 stop hosting-bot
```

## 🔒 Step 6: Setup Firewall (if needed)

```bash
# Allow port 3000 (if using UFW)
sudo ufw allow 3000/tcp

# Or if using iptables
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
```

## 🌐 Step 7: Setup Reverse Proxy with Nginx (Optional but Recommended)

### Install Nginx

```bash
sudo apt install -y nginx
```

### Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/hosting-bot
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # or your IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Enable the Site

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/hosting-bot /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## 🔐 Step 8: Setup SSL with Let's Encrypt (For HTTPS)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
```

## 📱 Step 9: Configure Telegram Bot

1. Update your `.env` file with the correct `TELEGRAM_WEB_APP_URL`
2. If using HTTPS, update to: `https://your-domain.com`
3. Restart the bot: `pm2 restart hosting-bot`

## ✅ Step 10: Verify Deployment

1. Check if the server is running:
   ```bash
   curl http://localhost:3000/health
   ```

2. Test in Telegram:
   - Open your bot
   - Send `/start`
   - Click the "Deploy Repository" button
   - It should open the web interface

## 🐛 Troubleshooting

### Check Logs

```bash
# PM2 logs
pm2 logs hosting-bot

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Common Issues

1. **Port already in use:**
   ```bash
   sudo lsof -i :3000
   # Kill the process or change PORT in .env
   ```

2. **Permission denied:**
   ```bash
   sudo chown -R $USER:$USER /opt/testhost
   ```

3. **Node modules issues:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## 🔄 Updating the Application

```bash
cd /opt/testhost
git pull
npm install
npm run web:build
npm run build
pm2 restart hosting-bot
```

## 📊 Monitoring

```bash
# PM2 monitoring
pm2 monit

# System resources
htop
```

## 🎉 Done!

Your bot should now be running on your Debian 12 machine!

