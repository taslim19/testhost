# 🚀 Telegram GitHub Deployment Bot

A powerful Telegram bot that allows you to deploy GitHub repositories to various hosting platforms (Vercel, Netlify, Railway) directly from Telegram using a beautiful web interface.

## ✨ Features

- 🔐 **GitHub OAuth Integration** - Secure authentication with GitHub
- 📦 **Repository Management** - View and manage all your GitHub repositories
- 🚀 **Multi-Platform Deployment** - Deploy to Vercel, Netlify, or Railway
- 💬 **Telegram Mini App** - Beautiful web interface embedded in Telegram
- 📱 **Real-time Notifications** - Get notified about deployment status
- 🎨 **Modern UI** - Clean and intuitive user interface

## 🏗️ Architecture

- **Backend**: Node.js + TypeScript + Express
- **Bot Framework**: grammY (Telegram Bot API)
- **Frontend**: React + Vite
- **GitHub Integration**: Octokit
- **Deployment Platforms**: Vercel, Netlify, Railway APIs

## 📋 Prerequisites

- Node.js 18+ and npm
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- GitHub OAuth App credentials
- (Optional) API tokens for deployment platforms

## 🚀 Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Create Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` and follow instructions
3. Copy your bot token

### 3. Create GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Set:
   - **Application name**: Telegram Deployment Bot
   - **Homepage URL**: `https://your-domain.com`
   - **Authorization callback URL**: `https://your-domain.com/auth/github/callback`
4. Copy Client ID and generate Client Secret

### 4. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_WEB_APP_URL=https://your-domain.com

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=https://your-domain.com/auth/github/callback

PORT=3000
NODE_ENV=development

# Optional: Deployment platform tokens
VERCEL_TOKEN=your_vercel_token
NETLIFY_TOKEN=your_netlify_token
RAILWAY_TOKEN=your_railway_token

SESSION_SECRET=your_random_session_secret_here
```

### 5. Configure Telegram Web App

1. Open your bot in Telegram
2. Send `/setmenubutton` to [@BotFather](https://t.me/botfather)
3. Set the web app URL to your deployed URL

Or use inline keyboard buttons (already implemented in the code).

### 6. Build and Run

**Development:**
```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend (in development)
cd web && npm run dev
```

**Production:**
```bash
# Build frontend
npm run web:build

# Build backend
npm run build

# Start server
npm start
```

## 📱 Usage

1. Start a chat with your bot in Telegram
2. Send `/start` command
3. Click "🚀 Deploy Repository" button
4. Authenticate with GitHub
5. Select a repository and deployment platform
6. Click "🚀 Deploy" and wait for notifications!

## 🎯 Bot Commands

- `/start` - Start the bot and see welcome message
- `/deploy` - Open deployment interface
- `/repos` - View your repositories
- `/help` - Show help message

## 🔧 Deployment Platforms

### Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Settings → Tokens → Create Token
3. Add to `.env` as `VERCEL_TOKEN`

### Netlify
1. Go to [Netlify Dashboard](https://app.netlify.com/user/applications)
2. Create Personal Access Token
3. Add to `.env` as `NETLIFY_TOKEN`

### Railway
1. Go to [Railway Dashboard](https://railway.app/account)
2. Settings → Tokens → Create Token
3. Add to `.env` as `RAILWAY_TOKEN`

## 🏗️ Project Structure

```
.
├── src/
│   ├── index.ts              # Main server entry
│   ├── bot/
│   │   └── handlers.ts       # Bot command handlers
│   ├── web/
│   │   └── routes.ts         # Express routes for web app
│   └── services/
│       ├── github.ts         # GitHub API integration
│       └── deployment.ts    # Deployment platform integrations
├── web/
│   ├── src/
│   │   ├── App.tsx          # Main React component
│   │   ├── main.tsx         # React entry point
│   │   └── *.css            # Styles
│   ├── index.html           # HTML template
│   └── vite.config.ts       # Vite configuration
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 Security Notes

- Store GitHub tokens securely (consider using a database in production)
- Use HTTPS in production
- Set secure cookie flags
- Validate all user inputs
- Implement rate limiting

## 🚀 Deployment

### Deploy on Debian 12 (Local Machine)

For deploying on your local Debian 12 machine:

1. **Quick Setup:**
   ```bash
   # Clone the repository
   git clone https://github.com/taslim19/testhost.git
   cd testhost
   
   # Run setup script
   bash setup-debian.sh
   
   # Configure environment
   cp .env.example .env
   nano .env  # Edit with your credentials
   
   # Deploy
   bash deploy.sh
   ```

2. **Manual Setup:**
   See [DEPLOY.md](./DEPLOY.md) for detailed step-by-step instructions including:
   - Node.js installation
   - PM2 setup for process management
   - Nginx reverse proxy configuration
   - SSL/HTTPS setup with Let's Encrypt
   - Firewall configuration

### Deploy to Railway/Render/Fly.io

1. Push code to GitHub
2. Connect repository to your hosting platform
3. Set environment variables
4. Deploy!

### Webhook Setup (Production)

For production, use webhooks instead of polling:

1. Set `NODE_ENV=production`
2. Set webhook URL: `https://your-domain.com/webhook`
3. The bot will automatically use webhooks

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Add more deployment platforms
- Improve UI/UX
- Add features like deployment history
- Fix bugs

## 📝 License

MIT License - feel free to use this project for your own purposes!

## 🎉 Enjoy!

Happy deploying! 🚀

