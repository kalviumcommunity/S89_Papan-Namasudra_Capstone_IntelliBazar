const mongoose = require("mongoose");
const VideoAd = require("../models/VideoAd");
const User = require("../models/User");
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/intellibazar");

const sampleVideos = [
  {
    title: "Amazing Smartphone Deal!",
    description: "Check out this incredible smartphone with amazing features",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
    duration: 596,
    fileSize: 158008374,
    productName: "Premium Smartphone",
    productPrice: "₹25,999",
    productImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
    productCategory: "Electronics",
    productRating: 4.5,
    productReviews: 1250,
    views: 15420,
    status: "approved",
    isActive: true
  },
  {
    title: "Stylish Fashion Collection",
    description: "Discover the latest fashion trends",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050",
    duration: 653,
    fileSize: 140866302,
    productName: "Designer Dress",
    productPrice: "₹3,999",
    productImage: "https://images.unsplash.com/photo-1445205170230-053b83016050",
    productCategory: "Fashion",
    productRating: 4.2,
    productReviews: 567,
    views: 8930,
    status: "approved",
    isActive: true
  },
  {
    title: "Premium Watch Collection",
    description: "Luxury watches for every occasion",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1524592094714-0f0654e20314",
    duration: 15,
    fileSize: 2299653,
    productName: "Luxury Watch",
    productPrice: "₹15,999",
    productImage: "https://images.unsplash.com/photo-1524592094714-0f0654e20314",
    productCategory: "Watches",
    productRating: 4.8,
    productReviews: 234,
    views: 12340,
    status: "approved",
    isActive: true
  },
  {
    title: "Trendy Sneakers Collection",
    description: "Step up your style with these amazing sneakers",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772",
    duration: 15,
    fileSize: 1564824,
    productName: "Sport Sneakers",
    productPrice: "₹4,999",
    productImage: "https://images.unsplash.com/photo-1549298916-b41d501d3772",
    productCategory: "Footwear",
    productRating: 4.3,
    productReviews: 789,
    views: 9876,
    status: "approved",
    isActive: true
  },
  {
    title: "Modern Home Decor Ideas",
    description: "Transform your living space with these beautiful decor pieces",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
    duration: 60,
    fileSize: 26246026,
    productName: "Decorative Vase Set",
    productPrice: "₹2,499",
    productImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
    productCategory: "Home Decor",
    productRating: 4.6,
    productReviews: 345,
    views: 7654,
    status: "approved",
    isActive: true
  },
  {
    title: "Professional Kitchen Essentials",
    description: "Upgrade your cooking experience with premium kitchen tools",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136",
    duration: 15,
    fileSize: 1564824,
    productName: "Chef Knife Set",
    productPrice: "₹8,999",
    productImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136",
    productCategory: "Kitchen",
    productRating: 4.7,
    productReviews: 456,
    views: 11234,
    status: "approved",
    isActive: true
  }
];

async function addSampleVideos() {
  try {
    console.log("🔧 Adding sample videos to database...");

    // Find a demo user or create one
    let demoUser = await User.findOne({ email: "demo@intellibazar.com" });
    
    if (!demoUser) {
      console.log("Creating demo user...");
      demoUser = new User({
        username: "DemoUser",
        email: "demo@intellibazar.com",
        password: "hashedpassword", // This should be properly hashed in real scenario
        isVerified: true
      });
      await demoUser.save();
    }

    // Clear existing sample videos (except the first one which might be real)
    await VideoAd.deleteMany({ 
      uploadedBy: demoUser._id,
      title: { $ne: "Test Video - Smartphone Demo" }
    });

    // Add sample videos
    for (const videoData of sampleVideos) {
      const video = new VideoAd({
        ...videoData,
        uploadedBy: demoUser._id
      });
      await video.save();
      console.log(`✅ Added video: ${video.title}`);
    }

    console.log("🎉 Sample videos added successfully!");
    console.log(`Total videos in database: ${await VideoAd.countDocuments()}`);
    
  } catch (error) {
    console.error("❌ Error adding sample videos:", error);
  } finally {
    mongoose.connection.close();
  }
}

addSampleVideos();
