import { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authFn = req.auth;
  const auth = authFn ? authFn() : null;

  if (!auth?.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}
