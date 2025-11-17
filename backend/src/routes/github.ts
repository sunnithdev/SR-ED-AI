import { Router } from "express";
import User from "../models/User";
import { requireAuth } from "../middleware/requireAuth";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

// STEP 1 — redirect user to GitHub OAuth
router.get("/authorize", requireAuth, async (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: process.env.GITHUB_REDIRECT_URI!,
    scope: "repo read:user",
  });

  return res.redirect(
    `https://github.com/login/oauth/authorize?${params.toString()}`
  );
});

// STEP 2 — GitHub redirects here with CODE
router.get("/callback", requireAuth, async (req, res) => {
  const auth = req.auth?.();
  const code = req.query.code as string;

  // Exchange code for token
  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID!,
        client_secret: process.env.GITHUB_CLIENT_SECRET!,
        code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI!,
      }),
    }
  );

  const tokenData: any = await tokenResponse.json();

  // Save token to MongoDB
  await User.findOneAndUpdate(
    { clerkId: auth!.userId },
    {
      github: {
        accessToken: tokenData.access_token,
        tokenType: tokenData.token_type,
        scope: tokenData.scope,
      },
    },
    { upsert: true }
  );

  return res.send(`
      <script>
        alert('🎉 GitHub connected successfully!');
        window.location.href = 'http://localhost:4200';
      </script>
    `);
});

// STEP 3 — GET USER REPOS (new route)
router.get("/repos", requireAuth, async (req, res) => {
  try {
    const auth = req.auth?.();
    const user = await User.findOne({ clerkId: auth!.userId });

    if (!user?.github?.accessToken) {
      return res.status(400).json({ error: "GitHub not connected" });
    }

    const githubToken = user.github.accessToken;

    // Fetch repositories
    const repoRes = await fetch("https://api.github.com/user/repos?per_page=200", {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json"
      }
    });

    if (!repoRes.ok) {
      const errorData = await repoRes.json();
      console.warn("GitHub error:", errorData);
      return res.status(400).json({ error: "Failed to fetch repos", details: errorData });
    }

    const repos: any = await repoRes.json();

    return res.json({
      repos: repos.map((r: any) => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        private: r.private,
        url: r.html_url,
        description: r.description,
        defaultBranch: r.default_branch
      }))
    });

  } catch (err) {
    console.error("Repo fetch error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// GET COMMITS FOR A REPO
router.get("/commits/:owner/:repo", requireAuth, async (req, res) => {
  try {
    const auth = req.auth?.();
    const user = await User.findOne({ clerkId: auth!.userId });

    if (!user?.github?.accessToken) {
      return res.status(400).json({ error: "GitHub not connected" });
    }

    const token = user.github.accessToken;
    const { owner, repo } = req.params;

    const commitsRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=50`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!commitsRes.ok) {
      return res
        .status(400)
        .json({ error: "Failed to fetch commits", details: await commitsRes.json() });
    }

    const commits: any = await commitsRes.json();

    return res.json(
      commits.map((c: any) => ({
        sha: c.sha,
        message: c.commit.message,
        author: c.commit.author.name,
        email: c.commit.author.email,
        date: c.commit.author.date,
        url: c.html_url,
      }))
    );

  } catch (err) {
    console.error("Commit fetch error:", err);
    res.status(500).json({ error: "Server error fetching commits" });
  }
});


export default router;
