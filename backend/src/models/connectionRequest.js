import mongoose from "mongoose";

const connectionRequestSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

connectionRequestSchema.index({ from: 1, to: 1 }, { unique: true });

const ConnectionRequest = mongoose.model("ConnectionRequest", connectionRequestSchema);
export default ConnectionRequest;
