const express = require("express");
const multer = require("multer");
const VideoAd = require("../models/VideoAd");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();

// Configure multer for video uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept video files only
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  }
});

// GET /api/videos - Get all approved video ads
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const skip = (page - 1) * limit;

    let query = { status: "approved", isActive: true };
    if (category && category !== 'all') {
      query.productCategory = category;
    }

    const videos = await VideoAd.find(query)
      .populate("uploadedBy", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await VideoAd.countDocuments(query);

    res.json({
      success: true,
      data: videos,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalVideos: total,
        hasNext: skip + videos.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch videos",
      error: error.message
    });
  }
});

// GET /api/videos/user/my-videos - Get user's uploaded videos (requires authentication)
router.get("/user/my-videos", authenticateToken, async (req, res) => {
  try {
    const videos = await VideoAd.find({ uploadedBy: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error("Error fetching user videos:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user videos",
      error: error.message
    });
  }
});

// POST /api/videos/upload - Upload new video ad (requires authentication)
router.post("/upload", authenticateToken, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No video file provided"
      });
    }

    const {
      title,
      description,
      productName,
      productPrice,
      productImage,
      productCategory,
      productRating,
      productReviews
    } = req.body;

    // Validate required fields
    if (!title || !productName || !productPrice || !productImage || !productCategory) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // For now, we'll store the video as base64 (in production, use cloud storage)
    const videoBase64 = req.file.buffer.toString('base64');
    const videoUrl = `data:${req.file.mimetype};base64,${videoBase64}`;

    // Create thumbnail (placeholder for now)
    const thumbnailUrl = productImage; // Use product image as thumbnail

    const videoAd = new VideoAd({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      duration: 30, // Default duration, should be calculated from actual video
      fileSize: req.file.size,
      productName,
      productPrice,
      productImage,
      productCategory,
      productRating: productRating || 0,
      productReviews: productReviews || 0,
      uploadedBy: req.user.id
    });

    await videoAd.save();

    res.status(201).json({
      success: true,
      message: "Video uploaded successfully",
      data: videoAd
    });
  } catch (error) {
    console.error("Error uploading video:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload video",
      error: error.message
    });
  }
});

// POST /api/videos/:id/like - Toggle like on video (requires authentication)
router.post("/:id/like", authenticateToken, async (req, res) => {
  try {
    const video = await VideoAd.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found"
      });
    }

    const isLiked = video.toggleLike(req.user.id);
    await video.save();

    res.json({
      success: true,
      message: isLiked ? "Video liked" : "Video unliked",
      data: {
        isLiked,
        likeCount: video.likeCount
      }
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle like",
      error: error.message
    });
  }
});

// POST /api/videos/:id/view - Increment view count
router.post("/:id/view", async (req, res) => {
  try {
    const video = await VideoAd.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found"
      });
    }

    res.json({
      success: true,
      data: { views: video.views }
    });
  } catch (error) {
    console.error("Error incrementing view:", error);
    res.status(500).json({
      success: false,
      message: "Failed to increment view",
      error: error.message
    });
  }
});

// GET /api/videos/:id - Get specific video ad
router.get("/:id", async (req, res) => {
  try {
    const video = await VideoAd.findById(req.params.id)
      .populate("uploadedBy", "username email");

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found"
      });
    }

    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error("Error fetching video:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch video",
      error: error.message
    });
  }
});

// DELETE /api/videos/:id - Delete video (requires authentication)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const video = await VideoAd.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found"
      });
    }

    // Check if user owns the video or is admin
    if (video.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this video"
      });
    }

    await VideoAd.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Video deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete video",
      error: error.message
    });
  }
});

module.exports = router;
