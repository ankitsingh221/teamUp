import ChatRoom from "../models/chatRoom.js";
import Message from "../models/message.js";

export const createChatRoom = async (req, res, next) => {
  try {
    const { name, members, isGroup, teamId } = req.body;

    const chatRoom = await ChatRoom.create({
      name: isGroup ? name : undefined,
      members: isGroup ? members : [req.user._id, ...members],
      isGroup: isGroup || false,
      team: teamId || null,
    });

    res.status(201).json(chatRoom);
  } catch (error) {
    next(error);
  }
};

export const getUserChatRooms = async (req, res, next) => {
  try {
    const chatRooms = await ChatRoom.find({
      members: req.user._id,
    })
      .populate("members", "name email")
      .populate("lastMessage");

    res.json(chatRooms);
  } catch (error) {
    next(error);
  }
};

export const getChatRoomMessages = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ chatRoom: roomId }).populate("sender", "name email");

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export const deleteChatRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const chatRoom = await ChatRoom.findById(id);

    if (!chatRoom) return res.status(404).json({ message: "Chat room not found" });

    await chatRoom.deleteOne();
    res.json({ message: "Chat room deleted successfully" });
  } catch (error) {
    next(error);
  }
};
