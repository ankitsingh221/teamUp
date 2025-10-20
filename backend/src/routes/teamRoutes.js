import express from "express";
import {
  createTeam,
  getUserTeams,
  addMemberToTeam,
  removeMemberFromTeam,
  deleteTeam,
} from "../controllers/teamController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createTeam);
router.get("/", protect, getUserTeams);
router.put("/add", protect, addMemberToTeam);
router.put("/remove", protect, removeMemberFromTeam);
router.delete("/:id", protect, deleteTeam);

export default router;
