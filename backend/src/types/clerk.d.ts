import "@clerk/express";

declare module "express-serve-static-core" {
  interface Request {
    auth?: () => {
      userId: string;
      sessionId: string | null;
      getToken: (opts?: { template?: string }) => Promise<string | null>;
      sessionClaims?: any;
    };
  }
}
