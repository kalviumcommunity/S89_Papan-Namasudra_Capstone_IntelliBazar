const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String, unique: true, sparse: true },
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  role: {
    type: String,
    enum: ['user', 'seller', 'admin'],
    default: "user"
  },
  phone: { type: String },
  address: { type: String }, // Keep for backward compatibility
  bio: { type: String },
  profilePhoto: { type: String }, // URL or base64 string for profile photo

  // Seller-specific fields
  sellerInfo: {
    businessName: { type: String },
    businessAddress: { type: String },
    businessPhone: { type: String },
    businessEmail: { type: String },
    gstNumber: { type: String },
    panNumber: { type: String },
    bankDetails: {
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
      accountHolderName: { type: String }
    },
    isVerified: { type: Boolean, default: false },
    verificationDocuments: [{
      type: { type: String }, // 'gst', 'pan', 'bank_statement', etc.
      url: { type: String },
      uploadedAt: { type: Date, default: Date.now }
    }],
    appliedAt: { type: Date },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectionReason: { type: String }
  },

  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual to check if user is seller
userSchema.virtual('isSeller').get(function() {
  return this.role === 'seller';
});

// Virtual to check if user is admin
userSchema.virtual('isAdmin').get(function() {
  return this.role === 'admin';
});

// Virtual to check if seller is verified
userSchema.virtual('isVerifiedSeller').get(function() {
  return this.role === 'seller' && this.sellerInfo?.isVerified;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("User", userSchema);
