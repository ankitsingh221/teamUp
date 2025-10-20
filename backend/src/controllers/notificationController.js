 import Notification from "../models/notification.js";
 
/**
 * 🔔 Create notification
 */
export const createNotification = async (req, res) => {
  try {
    const { receiver, message, type, link } = req.body;

    if (!receiver || !message) {
      return res.status(400).json({ success: false, message: "Receiver and message required" });
    }

    const notification = new Notification({
      sender: req.user._id,
      receiver,
      message,
      type,
      link,
    });

    await notification.save();

    res.status(201).json({ success: true, notification });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ success: false, message: "Server error creating notification" });
  }
};

// Get all notifications for user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ receiver: req.user._id })
      .populate("sender", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: notifications.length, notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Server error fetching notifications" });
  }
};

// Mark notification as read
 
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!notification)
      return res.status(404).json({ success: false, message: "Notification not found" });

    res.status(200).json({ success: true, notification });
  } catch (error) {
    console.error("Error marking notification:", error);
    res.status(500).json({ success: false, message: "Server error updating notification" });
  }
};

/**
 * 🗑 Delete notification
 */
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification)
      return res.status(404).json({ success: false, message: "Notification not found" });

    if (notification.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await notification.deleteOne();
    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ success: false, message: "Server error deleting notification" });
  }
};
