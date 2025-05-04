const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const authRoutes = require("./authRoutes"); // Import the auth routes
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch((error) => console.error("Error connecting to MongoDB Atlas:", error));

// Handle invalid JSON payloads
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).send({ message: "Invalid JSON payload" });
    }
    next();
});

// Use the auth routes
app.use(""/api/auth, authRoutes);

// Default route
app.get("/", (req, res) => {
    try {
        res.status(200).send({ msg: "This is my backend" });
    } catch (error) {
        res.status(500).send({ message: "Error occurred" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});