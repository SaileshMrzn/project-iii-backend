import e from "express";
import {
  // googleAuth,
  registerUser,
  loginUser,
} from "../../controllers/authController.js";

const router = e.Router();

// router.post("/google", googleAuth);
router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
