import User from "../models/user.js";
import jwt from "jsonwebtoken";

//   Protect  route

export const authMiddleware = async (req, res, next) => {
  // Accept cookie or Authorization: Bearer <token>
  let token = null;
  if (req.cookies?.token) token = req.cookies.token;
  const authHeader = req.headers?.authorization;
  if (!token && authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Access denied. No token provided." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. User not found.",
      });
    }

    req.user = user; // attach user to request
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access denied. Token expired.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during authentication",
    });
  }
};

// Provide a `protect` alias for backward compatibility with routes importing `{ protect }`
export const protect = authMiddleware;
