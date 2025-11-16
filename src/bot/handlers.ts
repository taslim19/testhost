import { Bot, Context } from "grammy";

export function setupBotHandlers(bot: Bot) {
  // Start command
  bot.command("start", async (ctx: Context) => {
    await ctx.reply(
      "🚀 Welcome to the GitHub Deployment Bot!\n\n" +
        "I can help you deploy your GitHub repositories to various hosting platforms.\n\n" +
        "Commands:\n" +
        "/deploy - Open deployment interface\n" +
        "/repos - List your repositories\n" +
        "/help - Show help message",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🚀 Deploy Repository",
                web_app: { url: process.env.TELEGRAM_WEB_APP_URL || "http://localhost:3000" },
              },
            ],
          ],
        },
      }
    );
  });

  // Deploy command - opens web app
  bot.command("deploy", async (ctx: Context) => {
    await ctx.reply("Opening deployment interface...", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🚀 Open Deployment Panel",
              web_app: { url: process.env.TELEGRAM_WEB_APP_URL || "http://localhost:3000" },
            },
          ],
        ],
      },
    });
  });

  // List repositories command
  bot.command("repos", async (ctx: Context) => {
    await ctx.reply(
      "To view and deploy your repositories, please use the web interface:\n\n" +
        "Click the button below to open the deployment panel.",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "📦 View Repositories",
                web_app: { url: process.env.TELEGRAM_WEB_APP_URL || "http://localhost:3000" },
              },
            ],
          ],
        },
      }
    );
  });

  // Help command
  bot.command("help", async (ctx: Context) => {
    await ctx.reply(
      "📖 <b>GitHub Deployment Bot Help</b>\n\n" +
        "<b>Commands:</b>\n" +
        "/start - Start the bot\n" +
        "/deploy - Open deployment interface\n" +
        "/repos - List your repositories\n" +
        "/help - Show this help message\n\n" +
        "<b>Features:</b>\n" +
        "• Deploy GitHub repositories\n" +
        "• Support for multiple platforms (Vercel, Netlify, Railway)\n" +
        "• Real-time deployment status\n" +
        "• Easy repository management\n\n" +
        "Click the button below to get started!",
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🚀 Start Deploying",
                web_app: { url: process.env.TELEGRAM_WEB_APP_URL || "http://localhost:3000" },
              },
            ],
          ],
        },
      }
    );
  });

  // Handle web app data
  bot.on("message", async (ctx: Context) => {
    if (ctx.message?.web_app?.data) {
      try {
        const data = JSON.parse(ctx.message.web_app.data);
        
        if (data.type === "deployment_started") {
          await ctx.reply(
            `🚀 Deployment started!\n\n` +
            `Repository: ${data.repo}\n` +
            `Platform: ${data.platform}\n\n` +
            `I'll notify you when it's complete!`
          );
        } else if (data.type === "deployment_complete") {
          await ctx.reply(
            `✅ Deployment completed!\n\n` +
            `Repository: ${data.repo}\n` +
            `Platform: ${data.platform}\n` +
            `URL: ${data.url || "N/A"}\n\n` +
            `Status: ${data.status}`
          );
        }
      } catch (error) {
        console.error("Error parsing web app data:", error);
      }
    }
  });

  // Error handling
  bot.catch((err) => {
    console.error("Bot error:", err);
  });
}

