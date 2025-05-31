import e from "express";
import {
  scrapeKumariJobs,
  scrapeLinkedin,
  scrapeMeroJobs,
} from "../controllers/scrapeController.js";

const router = e.Router();

router.get("/linkedin", scrapeLinkedin);
router.get("/kumariJobs", scrapeKumariJobs);
router.get("/meroJobs", scrapeMeroJobs);

export default router;
