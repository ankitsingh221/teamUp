import express from "express";
import {
  createNotification,
  getNotifications,
  markAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a notification (usually internal but keep public endpoint for admin)
router.post("/", authMiddleware, createNotification);

// Get current user's notifications
router.get("/", authMiddleware, getNotifications);

// Mark a notification as read
router.post("/:id/read", authMiddleware, markAsRead);

// Delete a notification
router.delete("/:id", authMiddleware, deleteNotification);

export default router;
