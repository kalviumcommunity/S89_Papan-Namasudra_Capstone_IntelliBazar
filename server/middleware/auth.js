const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AdminUser = require("../models/AdminUser");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    // Try to verify as regular user token first
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
        return next();
      }
    } catch (userTokenError) {
      // If regular user token fails, try admin token
      try {
        const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET + "_ADMIN";
        const adminDecoded = jwt.verify(token, ADMIN_JWT_SECRET);
        const adminUser = await AdminUser.findById(adminDecoded.adminId);

        if (adminUser && adminUser.isActive) {
          // Create a user-like object for compatibility with existing middleware
          req.user = {
            id: adminUser._id,
            email: adminUser.email,
            username: adminUser.name,
            role: 'admin', // Admin users have admin role
            isAdmin: true
          };
          req.adminUser = adminUser; // Keep reference to original admin user
          return next();
        }
      } catch (adminTokenError) {
        // Both token types failed
        console.error("Authentication error:", userTokenError, adminTokenError);
      }
    }

    return res.status(401).json({
      success: false,
      message: "Invalid token."
    });

  } catch (error) {
    console.error("Authentication error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token."
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired."
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error during authentication."
    });
  }
};

module.exports = { authenticateToken };
