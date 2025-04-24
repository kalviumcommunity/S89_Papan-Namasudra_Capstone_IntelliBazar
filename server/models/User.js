const mongoose = require("mongoose");

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Middleware to update `updatedAt` before saving
userSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

// Export the User model
module.exports = mongoose.model("User", userSchema);