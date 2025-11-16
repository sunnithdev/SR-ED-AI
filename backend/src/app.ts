import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import routes from "./routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Clerk middleware
app.use(clerkMiddleware());


// API routes
app.use("/api", routes);

export default app;
