const express = require("express");
const router = express.Router();

// Test route
router.get("/test", (req, res) => {
  res.status(200).json({ message: "Test route is working" });
});

// Forgot Password test
router.post("/forgot-password", (req, res) => {
  res.status(200).json({ message: "Forgot password route is working" });
});

module.exports = router;
