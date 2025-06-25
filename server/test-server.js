const express = require("express");
const app = express();

app.use(express.json());

// Test route
app.get("/api/auth/test", (req, res) => {
  console.log('Test route hit');
  res.json({ message: "Test works" });
});

// Forgot password route
app.post("/api/auth/forgot-password", (req, res) => {
  console.log('Forgot password route hit');
  res.json({ message: "Forgot password works" });
});

app.listen(8081, () => {
  console.log("Test server running on port 8081");
});
