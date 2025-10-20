import mongoose from "mongoose";

const boardPostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Post title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    skillsRequired: {
      type: [String],
      default: [],
      set: (skills) =>
        Array.isArray(skills)
          ? skills.map((s) => s.trim().toLowerCase()).filter(Boolean)
          : [],
    },
    tags: {
      type: [String],
      default: [],
      set: (tags) =>
        Array.isArray(tags)
          ? tags.map((t) => t.trim().toLowerCase()).filter(Boolean)
          : [],
    },
    type: {
      type: String,
      enum: ["project", "hackathon", "team", "general"],
      default: "project",
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, trim: true, maxlength: 300 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
  },
  { timestamps: true }
);

/// ✅ Correct
boardPostSchema.index({ title: "text", description: "text" }); // full-text search
boardPostSchema.index({ skillsRequired: 1 }); // for filtering
boardPostSchema.index({ tags: 1 });


const BoardPost = mongoose.model("BoardPost", boardPostSchema);
export default BoardPost;
