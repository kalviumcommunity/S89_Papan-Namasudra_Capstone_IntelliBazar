const mongoose = require("mongoose");

const wishlistItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  productName: {
    type: String,
    required: true
  },
  productPrice: {
    type: String,
    required: true
  },
  productImage: {
    type: String,
    required: true
  },
  productCategory: {
    type: String,
    required: true
  },
  productRating: {
    type: Number,
    default: 0
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique product per user
wishlistItemSchema.index({ user: 1, productName: 1 }, { unique: true });

module.exports = mongoose.model("WishlistItem", wishlistItemSchema);
