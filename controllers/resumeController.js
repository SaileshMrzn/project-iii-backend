import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import Resume from "../models/resumeModel.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadResume = async (req, res) => {
  try {
    const resume = req.file;

    if (!resume) {
      res.status(401).json({ message: "Please upload a resume" });
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        public_id: `resumes/${Date.now()}-${resume.originalname}`,
      },
      async (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).send("Upload error");
        }

        await Resume.create({
          user: "",
          resume: result.secure_url,
          lastUsed: Date.now(),
        });

        return res.status(200).json({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    streamifier.createReadStream(resume.buffer).pipe(stream);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
