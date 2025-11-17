import { Router } from "express";

const router = Router();

/**
 * GET /api/public/github/commits?repo=owner/repo
 */
router.get("/commits", async (req, res) => {
  try {
    const repo = req.query.repo as string;
    if (!repo) return res.status(400).json({ error: "repo (owner/repo) required" });

    const url = `https://api.github.com/repos/${repo}/commits?per_page=100`;

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({
        error: "Failed to fetch commits from GitHub",
        status: response.status,
      });
    }

    const data = await response.json();

    // Normalize commit structure
    const commits = data.map((c: any) => ({
      sha: c.sha,
      message: c.commit.message,
      date: c.commit.author.date,
      author: c.commit.author.name,
    }));

    return res.json({ commits });

  } catch (err) {
    console.error("Public GitHub error:", err);
    res.status(500).json({ error: "Failed to fetch public repo commits" });
  }
});

export default router;
