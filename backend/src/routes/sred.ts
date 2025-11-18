import { Router } from "express";
import RepoReport from "../models/RepoReport";

const router = Router();

router.post("/save-report", async (req, res) => {
  try {
    const {
      userId,
      repoName,
      repoOwner,
      repoUrl,
      sredCommits,
      detailedReport,
    } = req.body;

    const saved = await RepoReport.create({
      userId,
      repoName,
      repoOwner,
      repoUrl,
      sredCommits,
      detailedReport,
    });

    res.json({ success: true, id: saved._id });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});


router.get("/list-reports", async (req, res) => {
  try {    
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }
    const reports = await RepoReport.find({ userId }).sort({ createdAt: -1 });

    res.json({ reports });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
