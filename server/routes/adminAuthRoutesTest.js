const express = require("express");
const router = express.Router();

console.log('🔧 Test admin auth routes file loaded');

// Simple test route
router.get("/test", (req, res) => {
  console.log('🧪 Test route hit in test admin auth');
  res.json({ message: "Test admin auth routes working!" });
});

console.log('🔧 Exporting test admin auth router');
module.exports = router;
