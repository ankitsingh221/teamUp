import User from "../models/user.js";
import { sanitizeUser } from "../utils/sanitizeUser.js";

/**
 * 🔍 Get all users (with optional filters)
 * Supports filtering by skills, branch, yearOfStudy, and interests
 */
// Validation middleware for updating user profile
import { body, validationResult } from "express-validator";

export const updateUserValidation = [
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters long")
    .isLength({ max: 50 })
    .withMessage("Name cannot exceed 50 characters")
    .trim(),
  body("email")
    .optional()
    .isEmail()
    .withMessage("A valid email is required")
    .normalizeEmail(),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("role")
    .optional()
    .isIn(["student", "instructor", "professional"])
    .withMessage("Role must be student, instructor, or professional"),
  body("skills")
    .optional()
    .isArray()
    .withMessage("Skills must be an array of strings")
    .custom((skills) => skills.every((skill) => typeof skill === "string"))
    .withMessage("Each skill must be a string"),
  body("bio")
    .optional()
    .isString()
    .withMessage("Bio must be a string")
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters")
    .trim(),
  body("profilePicture")
    .optional()
    .isURL()
    .withMessage("Profile picture must be a valid URL"),
  body("socialLinks.linkedin")
    .optional()
    .isURL()
    .withMessage("LinkedIn link must be a valid URL"),
  body("socialLinks.github")
    .optional()
    .isURL()
    .withMessage("GitHub link must be a valid URL"),
  body("socialLinks.twitter")
    .optional()
    .isURL()
    .withMessage("Twitter link must be a valid URL"),

  // middleware handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

export const getAllUsers = async (req, res) => {
  try {
    const { skill, branch, yearOfStudy, interest, search } = req.query;
    const query = {};

    if (skill) query.skills = { $regex: skill, $options: "i" };
    if (branch) query.branch = { $regex: branch, $options: "i" };
    if (yearOfStudy) query.yearOfStudy = Number(yearOfStudy);
    if (interest) query.interest = { $regex: interest, $options: "i" };
    if (search)
      query.name = { $regex: search, $options: "i" }; // global search by name

    const users = await User.find(query).select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      users: users.map((u) => sanitizeUser(u)),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Server error fetching users." });
  }
};

// Get a user by ID

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, message: "Server error fetching user." });
  }
};

// Update profile info
 
export const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "skills",
      "interest",
      "branch",
      "bio",
      "yearOfStudy",
      "profilePicture",
      "socialLinks",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: "Server error updating profile." });
  }
};

 //Connect / Add Friend

export const connectUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;

    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot connect to yourself" });
    }

    const user = await User.findById(req.user._id);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ success: false, message: "Target user not found" });
    }

    if (user.connections.includes(targetUserId)) {
      return res.status(400).json({ success: false, message: "Already connected" });
    }

    user.connections.push(targetUserId);
    targetUser.connections.push(req.user._id);

    await user.save();
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: "Connected successfully",
    });
  } catch (error) {
    console.error("Error connecting users:", error);
    res.status(500).json({ success: false, message: "Server error connecting users." });
  }
};

 // Remove Connection
 
export const removeConnection = async (req, res) => {
  try {
    const targetUserId = req.params.id;

    const user = await User.findById(req.user._id);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser)
      return res.status(404).json({ success: false, message: "Target user not found" });

    user.connections = user.connections.filter(
      (id) => id.toString() !== targetUserId
    );
    targetUser.connections = targetUser.connections.filter(
      (id) => id.toString() !== req.user._id.toString()
    );

    await user.save();
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: "Connection removed successfully",
    });
  } catch (error) {
    console.error("Error removing connection:", error);
    res.status(500).json({ success: false, message: "Server error removing connection." });
  }
};

// Get user connections
 
export const getConnections = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("connections", "name skills branch yearOfStudy profilePicture");

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({
      success: true,
      connections: user.connections.map((u) => sanitizeUser(u)),
    });
  } catch (error) {
    console.error("Error fetching connections:", error);
    res.status(500).json({ success: false, message: "Server error fetching connections." });
  }
};
