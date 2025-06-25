const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminUserSchema = new mongoose.Schema({
  // Basic Admin Credentials
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },

  // Admin Profile Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 18,
    max: 100
  },
  aadharCard: {
    type: String,
    required: true,
    trim: true,
    minlength: 12,
    maxlength: 12
  },
  panCard: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    minlength: 10,
    maxlength: 10
  },

  // Security & Access
  isActive: {
    type: Boolean,
    default: true // Simplified - no approval needed
  },
  lastLogin: {
    type: Date
  },

  // Audit Trail
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
adminUserSchema.index({ email: 1 });
adminUserSchema.index({ aadharCard: 1 });
adminUserSchema.index({ panCard: 1 });

// Pre-save middleware
adminUserSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();

  // Hash password if modified
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }

  next();
});

// Instance methods
adminUserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Ensure password is not serialized
adminUserSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model("AdminUser", adminUserSchema);
