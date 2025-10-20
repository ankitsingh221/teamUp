import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
    },

    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
    seen: {
      type: Boolean,
      default: false,
    },
    fileUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);


messageSchema.index({sender:1, receiver:1, createdAt: -1});

const Message =  mongoose.model("Message", messageSchema);
export default Message;

