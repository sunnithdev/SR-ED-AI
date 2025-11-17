import { Router } from "express";
import authRoutes from "./auth";
import githubRoutes from "./github";
import aiRoutes from "./ai";
import publicGitHub from "./public-github";
// import jiraRoutes from "./jira";

const router = Router();

router.use("/auth", authRoutes);
router.use("/integrations/github", githubRoutes);
router.use("/ai", aiRoutes);
router.use("/public/github", publicGitHub);
// router.use("/integrations/jira", jiraRoutes);

export default router;
