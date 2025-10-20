import Message from "../models/message.js";
import User from "../models/user.js";


export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID and message content are required.",
      });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found.",
      });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
    });

    // Populate sender & receiver details
    await message.populate([
      { path: "sender", select: "name profilePicture" },
      { path: "receiver", select: "name profilePicture" },
    ]);

    // Emit real-time message using Socket.io (if available)
    if (req.io?.onlineUsers?.get) {
      const recipientSocketId = req.io.onlineUsers.get(receiverId.toString());
      if (recipientSocketId) {
        req.io.instance.to(recipientSocketId).emit("receiveMessage", message);
      }
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: message,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sending message.",
    });
  }
};


export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name profilePicture")
      .populate("receiver", "name profilePicture");

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching messages.",
    });
  }
};


export const getConversations = async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: [{ $toString: "$sender" }, req.user._id.toString()] },
              "$receiver",
              "$sender",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
    ]);

    // Populate sender and receiver for last message
    const populatedConversations = await User.populate(conversations, [
      { path: "lastMessage.sender", select: "name profilePicture" },
      { path: "lastMessage.receiver", select: "name profilePicture" },
    ]);

    res.status(200).json({
      success: true,
      conversations: populatedConversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching conversations.",
    });
  }
};
