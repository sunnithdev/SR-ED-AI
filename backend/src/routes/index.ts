import { Router } from "express";
import authRoutes from "./auth";
import githubRoutes from "./github";
import aiRoutes from "./ai";
import sredRoutes from "./sred";
// import jiraRoutes from "./jira";

const router = Router();

router.use("/auth", authRoutes);
router.use("/github", githubRoutes);
router.use("/ai", aiRoutes);
router.use("/sred", sredRoutes);
// router.use("/jira", jiraRoutes);

export default router;
