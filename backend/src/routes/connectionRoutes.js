import express from "express";
import {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  removeConnection,
  getMyConnections,
} from "../controllers/connectionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Send a connection request to a user
router.post("/request/:userId", authMiddleware, sendConnectionRequest);

// Accept / Reject a connection request (by notification id)
router.post("/accept/:notificationId", authMiddleware, acceptConnectionRequest);
router.post("/reject/:notificationId", authMiddleware, rejectConnectionRequest);

// Remove an existing connection
router.delete("/remove/:userId", authMiddleware, removeConnection);

// Get current user's connections
router.get("/", authMiddleware, getMyConnections);

export default router;
