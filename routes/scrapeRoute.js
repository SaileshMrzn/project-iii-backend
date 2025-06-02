import e from "express";
import {
  scrapeKumariJobs,
  scrapeLinkedin,
  scrapeMeroJobs,
  scrapeAll,
} from "../controllers/scrapeController.js";
import protect from "../middlewares/protected.js";

const router = e.Router();

// router.use(protect);

router.get("/linkedin", scrapeLinkedin);
router.get("/kumariJobs", scrapeKumariJobs);
router.get("/meroJobs", scrapeMeroJobs);
router.get("/all", scrapeAll);

export default router;
