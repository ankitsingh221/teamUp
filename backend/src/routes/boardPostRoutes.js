import express from "express";
import {
  createPost,
  getPost,
  updatePost,
  deletePost,
  getAllPosts,
  toggleLike,
  addComment,
  createPostValidation,
  updatePostValidation,
} from "../controllers/boardPostController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/", getAllPosts);
router.get("/:id", getPost);

// Protected
router.post("/", authMiddleware, createPostValidation, createPost);
router.put("/:id", authMiddleware, updatePostValidation, updatePost);
router.delete("/:id", authMiddleware, deletePost);
router.post("/:id/like", authMiddleware, toggleLike);
router.post("/:id/comment", authMiddleware, addComment);

export default router;
