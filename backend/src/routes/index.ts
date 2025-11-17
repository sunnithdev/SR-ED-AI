import { Router } from "express";
import authRoutes from "./auth";
import githubRoutes from "./github";
import aiRoutes from "./ai";
// import jiraRoutes from "./jira";

const router = Router();

router.use("/auth", authRoutes);
router.use("/integrations/github", githubRoutes);
router.use("/ai", aiRoutes);
// router.use("/integrations/jira", jiraRoutes);

export default router;
