// src/middleware/multer.ts
import multer from "multer";
// import path from "path";

const storage = multer.memoryStorage(); // stores file in memory (buffer), or use diskStorage for saving to disk

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"));
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
