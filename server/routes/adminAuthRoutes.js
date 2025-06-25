const express = require("express");
const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");
const router = express.Router();

console.log('🔧 Admin auth routes file loaded');

// Add CORS headers for admin auth routes
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});



// Admin JWT Secret (separate from regular user JWT)
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET + "_ADMIN";

// Admin Authentication Middleware
const authenticateAdminToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required"
      });
    }

    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
    const adminUser = await AdminUser.findById(decoded.adminId);

    if (!adminUser || !adminUser.isActive) {
      return res.status(403).json({
        success: false,
        message: "Admin access denied"
      });
    }
    req.adminUser = adminUser;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Invalid admin token"
    });
  }
};

// POST /api/admin/register - Admin registration
router.post("/register", async (req, res) => {
  try {
    const { email, password, confirmPassword, name, businessName, age, aadharCard, panCard } = req.body;

    // Validate required fields
    if (!email || !password || !confirmPassword || !name || !businessName || !age || !aadharCard || !panCard) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address"
      });
    }

    // Validate Aadhar card (12 digits)
    if (!/^\d{12}$/.test(aadharCard)) {
      return res.status(400).json({
        success: false,
        message: "Aadhar card must be 12 digits"
      });
    }

    // Validate PAN card (10 characters)
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panCard.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: "PAN card format is invalid"
      });
    }

    // Check if admin email already exists
    const existingAdmin = await AdminUser.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    // Check if Aadhar card already exists
    const existingAadhar = await AdminUser.findOne({ aadharCard });
    if (existingAadhar) {
      return res.status(400).json({
        success: false,
        message: "Aadhar card already registered"
      });
    }

    // Check if PAN card already exists
    const existingPan = await AdminUser.findOne({ panCard: panCard.toUpperCase() });
    if (existingPan) {
      return res.status(400).json({
        success: false,
        message: "PAN card already registered"
      });
    }

    // Create admin user
    const adminUser = new AdminUser({
      email,
      password,
      name,
      businessName,
      age: parseInt(age),
      aadharCard,
      panCard: panCard.toUpperCase()
    });

    await adminUser.save();

    res.status(201).json({
      success: true,
      message: "Admin account created successfully. You can now login.",
      adminId: adminUser._id
    });

  } catch (error) {
    console.error("❌ Admin registration error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating admin account",
      error: error.message
    });
  }
});

// POST /api/admin/login - Admin login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find admin user by email
    console.log('🔍 Looking for admin user:', email);
    const adminUser = await AdminUser.findOne({ email });

    if (!adminUser) {
      console.log('❌ Admin user not found');
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials"
      });
    }

    console.log('✅ Admin user found:', adminUser.email);

    // Check if account is active
    if (!adminUser.isActive) {
      return res.status(403).json({
        success: false,
        message: "Admin account is not active"
      });
    }

    // Verify password
    const isPasswordValid = await adminUser.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials"
      });
    }

    // Update last login
    adminUser.lastLogin = new Date();
    await adminUser.save();

    // Generate admin JWT token
    const adminToken = jwt.sign(
      {
        adminId: adminUser._id,
        email: adminUser.email,
        name: adminUser.name
      },
      ADMIN_JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      success: true,
      message: "Admin login successful",
      adminToken,
      adminUser: {
        id: adminUser._id,
        email: adminUser.email,
        name: adminUser.name,
        businessName: adminUser.businessName,
        lastLogin: adminUser.lastLogin
      }
    });

  } catch (error) {
    console.error("❌ Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Error during admin login",
      error: error.message
    });
  }
});

// POST /api/admin-auth/logout - Admin logout
router.post("/logout", authenticateAdminToken, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Admin logout successful"
    });
  } catch (error) {
    console.error("Admin logout error:", error);
    res.status(500).json({
      success: false,
      message: "Error during admin logout"
    });
  }
});

// GET /api/admin-auth/verify - Verify admin token
router.get("/verify", authenticateAdminToken, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Admin token is valid",
      adminUser: {
        id: req.adminUser._id,
        email: req.adminUser.email,
        name: req.adminUser.name,
        businessName: req.adminUser.businessName,
        lastLogin: req.adminUser.lastLogin
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error verifying admin token"
    });
  }
});

module.exports = router;
