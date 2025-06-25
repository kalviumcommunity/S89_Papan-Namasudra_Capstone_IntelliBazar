const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  
  // Address Details
  label: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  }, // e.g., "Home", "Office", "Apartment"
  
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  
  phone: {
    type: String,
    required: true,
    trim: true
  },
  
  address: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  
  state: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  
  pincode: {
    type: String,
    required: true,
    trim: true,
    match: /^[0-9]{6}$/
  },
  
  country: {
    type: String,
    required: true,
    default: "India",
    trim: true,
    maxlength: 50
  },
  
  // Address Type
  type: {
    type: String,
    enum: ["home", "office", "other"],
    default: "home"
  },
  
  // Default Address Flag
  isDefault: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
addressSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure only one default address per user
addressSchema.pre('save', async function(next) {
  if (this.isDefault) {
    // Remove default flag from other addresses of the same user
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Index for faster queries
addressSchema.index({ userId: 1, isDefault: -1 });
addressSchema.index({ userId: 1, createdAt: -1 });

// Virtual for full name
addressSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for formatted address
addressSchema.virtual('formattedAddress').get(function() {
  return `${this.address}, ${this.city}, ${this.state} - ${this.pincode}, ${this.country}`;
});

// Ensure virtuals are included in JSON output
addressSchema.set('toJSON', { virtuals: true });
addressSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Address", addressSchema);
