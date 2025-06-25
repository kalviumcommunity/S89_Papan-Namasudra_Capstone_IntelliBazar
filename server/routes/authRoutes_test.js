const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const { sendPasswordResetEmail } = require("../utils/emailService");

const router = express.Router();

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
