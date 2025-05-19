import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";

import compareRoutes from "./routes/public/compareRoutes.js";

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

app.use(express.json());

app.use("/api/public", compareRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
