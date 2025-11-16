import app from "./app";
import mongoose from "mongoose";

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

async function start() {
  try {

    if (!MONGO_URI) {
      throw new Error("MONGO_URI is missing in environment variables");
    }
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

void start();
