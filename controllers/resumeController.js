import { v2 as cloudinary } from "cloudinary";
import Resume from "../models/resumeModel.js";
import sha256 from "crypto-js/sha256.js";
import WordArray from "crypto-js/lib-typedarrays.js";

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

    const base64string = `data:${
      resume.mimetype
    };base64,${resume.buffer.toString("base64")}`;

    // generate hash
    function bufferToWordArray(buf) {
      return WordArray.create(buf);
    }

    const fileBuffer = resume.buffer;
    const wordArray = bufferToWordArray(fileBuffer);
    const hashDigest = sha256(wordArray).toString();

    const alreadyExists = await Resume.findOne({ hash: hashDigest });

    if (alreadyExists) {
      res.status(200).json({ message: "Duplicate resume" });
      return;
    }

    const result = await cloudinary.uploader.upload(base64string, {
      resource_type: "raw",
      folder: "resumes",
      public_id: `${Date.now()}-${resume.originalname.split(".")[0]}.pdf`,
    });

    const resumeRes = await Resume.create({
      // user: "",
      hash: hashDigest,
      url: result.secure_url,
      lastUsed: new Date().toISOString(),
    });

    res.status(200).json({ message: "Resume added", resumeRes });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
