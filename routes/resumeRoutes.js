import e from "express";
import { uploadResume } from "../controllers/resumeController.js";
import upload from "../middlewares/multer.js";

const router = e.Router();

router.post("/cloudinary/resume", upload, uploadResume);

export default router;
