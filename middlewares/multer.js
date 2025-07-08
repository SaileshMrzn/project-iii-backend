import multer from "multer";

const storage = multer.memoryStorage(); // stores file in memory (buffer), or use diskStorage for saving to disk

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error("Only PDF files are allowed");
    error.status = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
}).single("resume");

const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer error (e.g., file too large)
      return res.status(400).json({
        error: true,
        message: `File upload error: ${err.message}`,
      });
    } else if (err) {
      // Other errors (e.g., file type not allowed)
      return res.status(err.status || 400).json({
        error: true,
        message: err.message,
      });
    }
    next();
  });
};

export default uploadMiddleware;
