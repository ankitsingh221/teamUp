import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "BoardPost" },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

const Team = mongoose.model("Team", teamSchema);
export default Team;
