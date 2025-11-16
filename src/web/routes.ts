import express, { Request, Response } from "express";
import { Bot } from "grammy";
import { githubService } from "../services/github.js";
import { deploymentService } from "../services/deployment.js";

export function setupWebRoutes(app: express.Application, bot: Bot) {
  // GitHub OAuth - initiate
  app.get("/auth/github", async (req: Request, res: Response) => {
    const authUrl = githubService.getAuthUrl();
    res.redirect(authUrl);
  });

  // GitHub OAuth - callback
  app.get("/auth/github/callback", async (req: Request, res: Response) => {
    const { code } = req.query;
    
    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Missing authorization code" });
    }

    try {
      const token = await githubService.exchangeCodeForToken(code);
      // In production, store token securely (e.g., in database with user ID)
      // For now, we'll use a simple session approach
      res.cookie("github_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      
      res.redirect("/?authenticated=true");
    } catch (error) {
      console.error("OAuth error:", error);
      res.status(500).json({ error: "Failed to authenticate" });
    }
  });

  // Get user repositories
  app.get("/api/repos", async (req: Request, res: Response) => {
    const token = req.cookies?.github_token;
    
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const repos = await githubService.getUserRepos(token);
      res.json(repos);
    } catch (error) {
      console.error("Error fetching repos:", error);
      res.status(500).json({ error: "Failed to fetch repositories" });
    }
  });

  // Deploy repository
  app.post("/api/deploy", async (req: Request, res: Response) => {
    const { repo, platform, branch = "main" } = req.body;
    const token = req.cookies?.github_token;
    const userId = req.query.userId as string; // Telegram user ID from web app

    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!repo || !platform) {
      return res.status(400).json({ error: "Missing repo or platform" });
    }

    try {
      const deployment = await deploymentService.deploy({
        repo,
        platform,
        branch,
        githubToken: token,
        userId,
      });

      // Notify user via bot if userId is provided
      if (userId) {
        try {
          await bot.api.sendMessage(
            parseInt(userId),
            `🚀 Deployment started!\n\nRepository: ${repo}\nPlatform: ${platform}`
          );
        } catch (err) {
          console.error("Failed to send notification:", err);
        }
      }

      res.json({ success: true, deployment });
    } catch (error: any) {
      console.error("Deployment error:", error);
      res.status(500).json({ error: error.message || "Deployment failed" });
    }
  });

  // Get deployment status
  app.get("/api/deployment/:id/status", async (req: Request, res: Response) => {
    const { id } = req.params;
    
    try {
      const status = await deploymentService.getStatus(id);
      res.json(status);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get status" });
    }
  });

  // Serve web app (fallback to index.html for SPA)
  app.get("*", (req: Request, res: Response) => {
    res.sendFile("index.html", { root: "web/dist" });
  });
}

