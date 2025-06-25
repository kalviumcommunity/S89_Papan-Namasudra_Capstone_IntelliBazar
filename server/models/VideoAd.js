const mongoose = require("mongoose");

const videoAdSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in seconds
    required: true
  },
  fileSize: {
    type: Number, // in bytes
    required: true
  },
  // Associated product information
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
    default: 0,
    min: 0,
    max: 5
  },
  productReviews: {
    type: Number,
    default: 0
  },
  // User who uploaded the video
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // Engagement metrics
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: {
    type: Number,
    default: 0
  },
  // Video status and moderation
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "archived"],
    default: "pending"
  },
  isActive: {
    type: Boolean,
    default: true
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

// Indexes for better query performance
videoAdSchema.index({ status: 1, isActive: 1, createdAt: -1 });
videoAdSchema.index({ uploadedBy: 1 });
videoAdSchema.index({ productCategory: 1 });
videoAdSchema.index({ views: -1 });

// Virtual for like count
videoAdSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Method to check if user has liked the video
videoAdSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

// Method to toggle like
videoAdSchema.methods.toggleLike = function(userId) {
  const existingLikeIndex = this.likes.findIndex(
    like => like.user.toString() === userId.toString()
  );
  
  if (existingLikeIndex > -1) {
    // Unlike
    this.likes.splice(existingLikeIndex, 1);
    return false;
  } else {
    // Like
    this.likes.push({ user: userId });
    return true;
  }
};

// Pre-save middleware to update the updatedAt field
videoAdSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure virtual fields are serialized
videoAdSchema.set('toJSON', { virtuals: true });
videoAdSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("VideoAd", videoAdSchema);
