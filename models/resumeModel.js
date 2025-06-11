import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resume: { type: String, required: true },
    matchedRole: { type: String },
    lastUsed: { type: Date, required: true },
  },
  { timestamps: true }
);

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;
