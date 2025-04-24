const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Product = require("./models/Product");
const Order = require("./models/Order");


const router = express.Router();

// Sign In
router.post("/signin", async (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password || !email) return res.status(400).send({ message: "All fields are required" });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await new User({ username, password: hashedPassword, email }).save();
        res.status(201).send({ message: "User registered successfully" });
    } catch (error) {
        res.status(400).send({ message: error.code === 11000 ? "Username or email already exists" : "Error registering user" });
    }
});

// Login
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).send({ message: "Username and password are required" });

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).send({ message: "User not found" });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).send({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).send({ message: "Login successful", token });
    } catch (error) {
        console.error("Error during login:", error); // Log the error
        res.status(500).send({ message: "Error logging in", error });
    }
});

module.exports = router;