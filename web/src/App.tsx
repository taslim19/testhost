import React, { useState, useEffect } from "react";
import "./App.css";

interface Repo {
  id: number;
  name: string;
  fullName: string;
  description: string;
  private: boolean;
  language: string;
  defaultBranch: string;
  url: string;
  cloneUrl: string;
  updatedAt: string;
}

interface TelegramWebApp {
  WebApp: {
    ready: () => void;
    expand: () => void;
    initData: string;
    initDataUnsafe: {
      user?: {
        id: number;
        first_name: string;
        username?: string;
      };
    };
    sendData: (data: string) => void;
    showAlert: (message: string) => void;
    showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
  };
}

declare global {
  interface Window {
    Telegram?: TelegramWebApp;
  }
}

function App() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [deploying, setDeploying] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("vercel");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/repos");
      if (response.ok) {
        const data = await response.json();
        setRepos(data);
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = "/auth/github";
  };

  const handleDeploy = async (repo: Repo) => {
    if (!window.Telegram?.WebApp) {
      alert("Telegram Web App not available");
      return;
    }

    const userId = window.Telegram.WebApp.initDataUnsafe.user?.id?.toString();

    setDeploying(repo.fullName);

    try {
      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repo: repo.fullName,
          platform: selectedPlatform,
          branch: repo.defaultBranch,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        // Send data back to bot
        window.Telegram.WebApp.sendData(
          JSON.stringify({
            type: "deployment_started",
            repo: repo.fullName,
            platform: selectedPlatform,
          })
        );

        window.Telegram.WebApp.showAlert(
          `🚀 Deployment started!\n\nRepository: ${repo.fullName}\nPlatform: ${selectedPlatform}\n\nYou'll be notified when it's complete.`
        );

        // Poll for status
        pollDeploymentStatus(data.deployment.id, repo);
      } else {
        window.Telegram.WebApp.showAlert(`❌ Deployment failed: ${data.error}`);
      }
    } catch (error: any) {
      window.Telegram.WebApp.showAlert(`❌ Error: ${error.message}`);
    } finally {
      setDeploying(null);
    }
  };

  const pollDeploymentStatus = async (deploymentId: string, repo: Repo) => {
    const maxAttempts = 30;
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/deployment/${deploymentId}/status`);
        const status = await response.json();

        if (status.status === "success") {
          window.Telegram.WebApp.sendData(
            JSON.stringify({
              type: "deployment_complete",
              repo: repo.fullName,
              platform: selectedPlatform,
              url: status.url,
              status: "success",
            })
          );
          return;
        }

        if (status.status === "error") {
          window.Telegram.WebApp.sendData(
            JSON.stringify({
              type: "deployment_complete",
              repo: repo.fullName,
              platform: selectedPlatform,
              status: "error",
              message: status.message,
            })
          );
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        }
      } catch (error) {
        console.error("Status poll error:", error);
      }
    };

    setTimeout(poll, 2000);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="container">
        <div className="auth-screen">
          <h1>🚀 GitHub Deployment Bot</h1>
          <p>Connect your GitHub account to deploy repositories</p>
          <button onClick={handleLogin} className="btn btn-primary">
            🔐 Connect with GitHub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <h1>🚀 Deploy Repository</h1>
        <p>Select a repository and platform to deploy</p>
      </header>

      <div className="platform-selector">
        <label>Deployment Platform:</label>
        <select
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          className="select"
        >
          <option value="vercel">Vercel</option>
          <option value="netlify">Netlify</option>
          <option value="railway">Railway</option>
        </select>
      </div>

      <div className="repo-list">
        {repos.length === 0 ? (
          <div className="empty-state">No repositories found</div>
        ) : (
          repos.map((repo) => (
            <div key={repo.id} className="repo-card">
              <div className="repo-header">
                <h3>{repo.name}</h3>
                <span className={`badge ${repo.private ? "private" : "public"}`}>
                  {repo.private ? "🔒 Private" : "🌐 Public"}
                </span>
              </div>
              {repo.description && (
                <p className="repo-description">{repo.description}</p>
              )}
              <div className="repo-meta">
                {repo.language && (
                  <span className="meta-item">💻 {repo.language}</span>
                )}
                <span className="meta-item">🌿 {repo.defaultBranch}</span>
              </div>
              <button
                onClick={() => handleDeploy(repo)}
                disabled={deploying === repo.fullName}
                className="btn btn-deploy"
              >
                {deploying === repo.fullName ? "⏳ Deploying..." : "🚀 Deploy"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;

