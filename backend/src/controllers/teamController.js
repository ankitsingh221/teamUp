import Team from "../models/team.js";
import { sanitizeUser } from "../utils/sanitizeUser.js";

export const createTeam = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Team name is required" });
    }

    const team = await Team.create({
      name,
      description,
      members: [req.user._id],
      createdBy: req.user._id,
    });

    res.status(201).json(team);
  } catch (error) {
    next(error);
  }
};

export const getUserTeams = async (req, res, next) => {
  try {
    const teams = await Team.find({ members: req.user._id }).populate("members", "name email");
    res.json(teams);
  } catch (error) {
    next(error);
  }
};

export const addMemberToTeam = async (req, res, next) => {
  try {
    const { teamId, userId } = req.body;
    const team = await Team.findById(teamId);

    if (!team) return res.status(404).json({ message: "Team not found" });

    if (!team.members.includes(userId)) {
      team.members.push(userId);
      await team.save();
    }

    res.json({ message: "Member added successfully", team });
  } catch (error) {
    next(error);
  }
};

export const removeMemberFromTeam = async (req, res, next) => {
  try {
    const { teamId, userId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    team.members = team.members.filter((id) => id.toString() !== userId);
    await team.save();

    res.json({ message: "Member removed successfully", team });
  } catch (error) {
    next(error);
  }
};

export const deleteTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id);

    if (!team) return res.status(404).json({ message: "Team not found" });
    if (team.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await team.deleteOne();
    res.json({ message: "Team deleted successfully" });
  } catch (error) {
    next(error);
  }
};


