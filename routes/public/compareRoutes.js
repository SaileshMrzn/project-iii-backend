import e from "express";
import { compareResumeAndJob } from "../../controllers/compareController.js";

const router = e.Router();

router.post("/compare", compareResumeAndJob);

export default router;
