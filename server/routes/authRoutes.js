const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

const router = express.Router();


// Sign In
router.post("/signin", async (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password || !email) return res.status(400).send({ message: "All fields are required" });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword)
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
        console.log(user.password)
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).send({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).send({ message: "Login successful", token });
    } catch (error) {
        console.error("Error during login:", error); // Log the error
        res.status(500).send({ message: "Error logging in", error });
    }
});


//update password
router.put("/update-password", async (req, res) => {
    const { username, oldPassword, newPassword } = req.body;
    if (!username || !oldPassword || !newPassword) {
        return res.status(400).send({ message: "Username, old password, and new password are required" });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).send({ message: "User not found" });

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) return res.status(401).send({ message: "Old password is incorrect" });

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();

        res.status(200).send({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).send({ message: "Error updating password", error });
    }
});


module.exports = router;