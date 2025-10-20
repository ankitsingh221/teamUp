import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    isGroup: { type: Boolean, default: false },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true }
);

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);
export default ChatRoom;
