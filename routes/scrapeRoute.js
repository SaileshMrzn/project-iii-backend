import e from "express";
import {
  scrapeKumariJobs,
  scrapeLinkedin,
} from "../controllers/scrapeController.js";

const router = e.Router();

router.post("/linkedin", scrapeLinkedin);
router.post("/kumariJobs", scrapeKumariJobs);

export default router;
