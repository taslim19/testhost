import { Octokit } from "octokit";

class GitHubService {
  private clientId: string;
  private clientSecret: string;
  private callbackUrl: string;

  constructor() {
    this.clientId = process.env.GITHUB_CLIENT_ID || "";
    this.clientSecret = process.env.GITHUB_CLIENT_SECRET || "";
    this.callbackUrl = process.env.GITHUB_CALLBACK_URL || "http://localhost:3000/auth/github/callback";
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      scope: "repo,user",
      state: Math.random().toString(36).substring(7),
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<string> {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error_description || "Failed to exchange code for token");
    }

    return data.access_token;
  }

  async getUserRepos(token: string): Promise<any[]> {
    const octokit = new Octokit({ auth: token });
    
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 100,
    });

    return data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      private: repo.private,
      language: repo.language,
      defaultBranch: repo.default_branch,
      url: repo.html_url,
      cloneUrl: repo.clone_url,
      updatedAt: repo.updated_at,
    }));
  }

  async getRepo(token: string, owner: string, repo: string): Promise<any> {
    const octokit = new Octokit({ auth: token });
    const { data } = await octokit.rest.repos.get({ owner, repo });
    return data;
  }
}

export const githubService = new GitHubService();

