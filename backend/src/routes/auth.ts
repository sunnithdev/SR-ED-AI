import { Router } from "express";
import User from "../models/User";

const router = Router();

router.post("/sync", async (req, res) => {
  try {
    const auth = req.auth?.();

    if (!auth?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = auth.userId;

    // Claims from your custom JWT template
    const claims = auth.sessionClaims || {};
    const email = claims.email || null;

    // 🔥 Upsert = create if not exist, update if exist
    const user = await User.findOneAndUpdate(
      { clerkId: userId },     // match condition
      { email: email },        // update fields
      { new: true, upsert: true }
    );

    return res.json({
      message: "User synced",
      user,
    });

  } catch (err) {
    console.error("Sync error:", err);
    return res.status(500).json({ error: "Failed to sync user" });
  }
});



export default router;
