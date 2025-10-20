import express from "express";
import {
  createChatRoom,
  getUserChatRooms,
  getChatRoomMessages,
  deleteChatRoom,
} from "../controllers/chatRoomController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createChatRoom);
router.get("/", protect, getUserChatRooms);
router.get("/:roomId/messages", protect, getChatRoomMessages);
router.delete("/:id", protect, deleteChatRoom);

export default router;
