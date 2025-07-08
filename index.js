import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import compareRoutes from "./routes/public/compareRoutes.js";
import authRoutes from "./routes/auth/authRoutes.js";
import scrapeRoutes from "./routes/scrapeRoute.js";
import resumeRoutes from "./routes/resumeRoutes.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected ✅`);
  } catch (error) {
    console.error(`Error connecting database ❌`);
    process.exit(1);
  }
};

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept"],
  })
);

app.use("/api/public", compareRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/scrape", scrapeRoutes);
app.use("/api", resumeRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
