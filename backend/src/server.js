import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";

// Import Models for saving messages
import Message from "./models/message.js";

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import connectionRoutes from "./routes/connectionRoutes.js";
import boardPostRoutes from "./routes/boardPostRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import chatRoomRoutes from "./routes/chatRoomRoutes.js";

// Initialize environment variables
dotenv.config();

// Connect to Database
connectDB();

// Create Express App & HTTP Server
const app = express();
const server = http.createServer(app);

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173"|| "http://localhost:5174",
    credentials: true,
  },
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173" || "http://localhost:5174",
    credentials: true,
  })
);

// Health Check Route
app.get("/", (req, res) => {
  res.json({ success: true, message: "TeamUP API is running..." });
});

//  Routes
app.use("/api/auth", authRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/posts", boardPostRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/chatrooms", chatRoomRoutes);


// SOCKET.IO REAL-TIME EVENTS

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(` Socket connected: ${socket.id}`);

  // Register user when connected
  socket.on("register", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(` User ${userId} registered with socket ${socket.id}`);
  });

  // Send Message Event
  socket.on("sendMessage", async (data) => {
    try {
      const { senderId, receiverId, message } = data;

      // Save message to DB
      const newMessage = await Message.create({
        sender: senderId,
        receiver: receiverId,
        content: message,
      });

      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit("receiveMessage", newMessage);
      }
    } catch (error) {
      console.error(" Error handling message:", error.message);
    }
  });

  // Typing Indicator
  socket.on("typing", (data) => {
    const { senderId, receiverId } = data;
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit("typing", { senderId });
    }
  });

  // User Disconnect
  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(` User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(" Error:", err.message);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
