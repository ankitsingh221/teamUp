import {
  registerUser,
  login,
  logout,
  getMe,
  loginValidation,
  registerValidation,
} from "../controllers/authController.js";
import express from "express";

const router = express.Router();
import { authMiddleware } from "../middleware/authMiddleware.js";

router.post("/register", registerValidation, registerUser);
router.post("/login", loginValidation, login);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);
// quick router health check
router.get("/ping", (req, res) =>
  res.json({ success: true, message: "auth router ok" })
);

export default router;
