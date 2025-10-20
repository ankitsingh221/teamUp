import express from "express";
import {
  sendMessage,
  getMessages,
  getConversations,
} from "../controllers/messageController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Send a message
router.post("/", authMiddleware, sendMessage);

// Get messages between current user and another
router.get("/:userId", authMiddleware, getMessages);

// Get conversations (list of chats with last message)
router.get("/conversations", authMiddleware, getConversations);

export default router;
