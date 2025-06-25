const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const crypto = require("crypto");
const User = require("../models/User");
const { sendPasswordResetEmail } = require("../utils/emailService");

const router = express.Router();

// JWT Verification Middleware
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Flexible Authentication Middleware (supports both JWT and session)
const verifyAuth = async (req, res, next) => {
  try {
    // Try JWT authentication first
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (user) {
          req.user = user;
          return next();
        }
      } catch (err) {
        // JWT failed, try session authentication
      }
    }

    // Try session authentication
    if (req.user) {
      return next();
    }

    return res.status(401).json({ message: "Authentication required" });
  } catch (err) {
    return res.status(500).json({ message: "Authentication error", error: err.message });
  }
};

// Manual Signup
router.post("/signup", async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
    return res.status(400).send({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, email });
    await newUser.save();
    res.status(201).send({ message: "User registered successfully" });
  } catch (error) {
    res.status(400).send({
      message:
        error.code === 11000 ? "Username or email already exists" : "Error registering user",
    });
  }
});

// Manual Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).send({ message: "Username and password are required" });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).send({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 3600000,
      })
      .status(200)
      .send({ message: "Login successful", token });
  } catch (error) {
    res.status(500).send({ message: "Error logging in", error });
  }
});

// Google OAuth Start
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "consent",
  })
);

// Google OAuth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: process.env.CLIENT_URL,
    session: true,
  }),
  (req, res) => {
    // Generate JWT token for Google OAuth users
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set token as cookie and redirect with token in URL for frontend to capture
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 3600000,
      })
      .redirect(`${process.env.CLIENT_URL}?token=${token}`);
  }
);

// ✅ Updated: Get Authenticated User (supports both JWT and Google)
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return res.status(404).send({ message: "User not found" });
      return res.status(200).send(user);
    }

    if (req.user) {
      return res.status(200).send(req.user);
    }

    return res.status(401).send({ message: "Unauthorized" });
  } catch (err) {
    return res.status(500).send({ message: "Something went wrong", error: err });
  }
});

// Update Profile
router.put("/profile", verifyAuth, async (req, res) => {
  try {
    const { username, email, phone, address, bio, profilePhoto } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!username || !email) {
      return res.status(400).json({ message: "Username and email are required" });
    }

    // Check if email is already taken by another user
    if (email !== req.user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: "Email is already taken by another user" });
      }
    }

    // Check if username is already taken by another user
    if (username !== req.user.username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: "Username is already taken by another user" });
      }
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        username,
        email,
        phone: phone || '',
        address: address || '',
        bio: bio || '',
        profilePhoto: profilePhoto || '',
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      message: "Error updating profile",
      error: error.message
    });
  }
});

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  req.logout(() => {
    req.session.destroy(() => {
      res.status(200).send({ message: "Logged out successfully" });
    });
  });
});

// Test route
router.get("/test-route", (req, res) => {
  console.log('🧪 Test route hit in authRoutes');
  res.json({ message: "Auth routes are working" });
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
    console.log('🔍 Forgot password request received');
    const { email } = req.body;
    console.log('📧 Email:', email);

    if (!email) {
      console.log('❌ No email provided');
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by email
    console.log('🔍 Looking for user with email:', email);
    const user = await User.findOne({ email });
    console.log('👤 User found:', user ? 'Yes' : 'No');

    if (!user) {
      // Don't reveal if email exists or not for security
      console.log('❌ User not found, returning generic success message');
      return res.status(200).json({
        message: "If an account with that email exists, we've sent password reset instructions."
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Send email using nodemailer
    console.log(`📧 Sending password reset email to: ${email}`);
    const emailResult = await sendPasswordResetEmail(email, resetToken);

    if (emailResult.success) {
      console.log('✅ Password reset email sent successfully');
      res.status(200).json({
        message: "Password reset instructions have been sent to your email address."
      });
    } else {
      console.error('❌ Failed to send email:', emailResult.error);
      res.status(500).json({
        message: "Failed to send reset email. Please try again later."
      });
    }

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Verify Reset Token
router.get("/verify-reset-token", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Reset token is required" });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    res.status(200).json({ message: "Reset token is valid" });

  } catch (error) {
    console.error("Verify reset token error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.updatedAt = new Date();
    await user.save();

    console.log(`✅ Password reset successful for user: ${user.email}`);
    res.status(200).json({ message: "Password has been reset successfully" });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
