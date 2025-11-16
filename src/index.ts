import { Bot, webhookCallback } from "grammy";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { setupBotHandlers } from "./bot/handlers.js";
import { setupWebRoutes } from "./web/routes.js";

dotenv.config();

const app = express();
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);

// Middleware
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.static("web/dist"));

// Setup bot handlers
setupBotHandlers(bot);

// Setup web routes (for Telegram Web App)
setupWebRoutes(app, bot);

// Webhook endpoint for production
app.use("/webhook", webhookCallback(bot, "express"));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;

// Start server
if (process.env.NODE_ENV === "production") {
  // Use webhook in production
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Webhook: https://your-domain.com/webhook`);
  });
} else {
  // Use polling in development
  app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    await bot.api.deleteWebhook();
    bot.start();
    console.log(`🤖 Bot started with polling`);
  });
}

