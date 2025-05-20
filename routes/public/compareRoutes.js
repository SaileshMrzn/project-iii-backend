import e from "express";
import { compareResumeAndJob } from "../../controllers/compareController.js";
import upload from "../../middlewares/multer.js";

const router = e.Router();

router.post("/compare", upload.single("resume"), compareResumeAndJob);

export default router;
