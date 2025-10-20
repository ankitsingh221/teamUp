import User from "../models/user.js";
import Notification from "../models/notification.js";


export const sendConnectionRequest = async (req, res, next) => {
  try {
    const receiverId = req.params.userId;
    const senderId = req.user._id;

    if (receiverId.toString() === senderId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a connection request to yourself.",
      });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });

    // Prevent duplicate requests or existing connections
    const alreadyConnected = receiver.connections.includes(senderId);
    if (alreadyConnected) {
      return res.status(400).json({
        success: false,
        message: "You are already connected with this user.",
      });
    }

    // Prevent duplicate notifications (pending requests)
    const existingNotification = await Notification.findOne({
      sender: senderId,
      receiver: receiverId,
      type: "connection_request",
      status: "pending",
    });

    if (existingNotification) {
      return res.status(400).json({
        success: false,
        message: "Connection request already sent.",
      });
    }

    // Create a notification for the receiver
    const notification = await Notification.create({
      sender: senderId,
      receiver: receiverId,
      type: "connection_request",
      message: "wants to connect with you.",
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Connection request sent successfully.",
      notification,
    });
  } catch (error) {
    next(error);
  }
};


export const acceptConnectionRequest = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.notificationId);
    if (!notification)
      return res
        .status(404)
        .json({ success: false, message: "Request not found." });

    if (notification.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to accept this request.",
      });
    }

    // Update both users' connections
    const sender = await User.findById(notification.sender);
    const receiver = await User.findById(notification.receiver);

    if (!sender || !receiver) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    sender.connections.push(receiver._id);
    receiver.connections.push(sender._id);
    await Promise.all([sender.save(), receiver.save()]);

    // Update notification status
    notification.status = "accepted";
    await notification.save();

    res.json({
      success: true,
      message: "Connection request accepted.",
      connection: receiver,
    });
  } catch (error) {
    next(error);
  }
};


export const rejectConnectionRequest = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.notificationId);
    if (!notification)
      return res
        .status(404)
        .json({ success: false, message: "Request not found." });

    if (notification.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to reject this request.",
      });
    }

    notification.status = "rejected";
    await notification.save();

    res.json({
      success: true,
      message: "Connection request rejected.",
    });
  } catch (error) {
    next(error);
  }
};


export const removeConnection = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(req.user._id);
    const targetUser = await User.findById(userId);

    if (!targetUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });

    currentUser.connections = currentUser.connections.filter(
      (id) => id.toString() !== userId
    );
    targetUser.connections = targetUser.connections.filter(
      (id) => id.toString() !== req.user._id.toString()
    );

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.json({
      success: true,
      message: "Connection removed successfully.",
    });
  } catch (error) {
    next(error);
  }
};


export const getMyConnections = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "connections",
      "name email profilePicture skills branch yearOfStudy"
    );

    res.json({
      success: true,
      connections: user.connections,
    });
  } catch (error) {
    next(error);
  }
};
