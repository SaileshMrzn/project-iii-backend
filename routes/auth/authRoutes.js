import e from "express";
import { googleAuth } from "../../controllers/authController.js";

const router = e.Router();

router.post("/google", googleAuth);

export default router;
