const mongoose = require('mongoose');
const VideoAd = require('../models/VideoAd');
const User = require('../models/User');
require('dotenv').config();

// Sample video data for testing
const sampleVideos = [
  {
    title: "Amazing Smartphone Deal!",
    description: "Check out this incredible smartphone with amazing features and unbeatable price!",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
    duration: 30,
    fileSize: 1048576, // 1MB
    productName: "Premium Smartphone X1",
    productPrice: "₹25,999",
    productImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
    productCategory: "Electronics",
    productRating: 4.5,
    productReviews: 1250,
    status: "approved",
    views: 15420,
    likes: []
  },
  {
    title: "Stylish Fashion Collection",
    description: "Discover the latest fashion trends with our exclusive designer collection",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400",
    duration: 25,
    fileSize: 2097152, // 2MB
    productName: "Designer Summer Dress",
    productPrice: "₹3,999",
    productImage: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400",
    productCategory: "Fashion",
    productRating: 4.2,
    productReviews: 567,
    status: "approved",
    views: 8930,
    likes: []
  },
  {
    title: "Premium Watch Collection",
    description: "Luxury watches for every occasion - timeless elegance meets modern technology",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400",
    duration: 35,
    fileSize: 1572864, // 1.5MB
    productName: "Luxury Chronograph Watch",
    productPrice: "₹15,999",
    productImage: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400",
    productCategory: "Watches",
    productRating: 4.8,
    productReviews: 234,
    status: "approved",
    views: 12340,
    likes: []
  },
  {
    title: "Sports Gear Showcase",
    description: "Get ready for your workout with our premium sports equipment and gear",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
    duration: 28,
    fileSize: 2097152, // 2MB
    productName: "Professional Running Shoes",
    productPrice: "₹7,999",
    productImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
    productCategory: "Sports",
    productRating: 4.6,
    productReviews: 892,
    status: "approved",
    views: 6750,
    likes: []
  },
  {
    title: "Home Decor Inspiration",
    description: "Transform your living space with our beautiful home decor collection",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    duration: 32,
    fileSize: 1310720, // 1.25MB
    productName: "Modern Table Lamp",
    productPrice: "₹2,499",
    productImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    productCategory: "Home Decor",
    productRating: 4.3,
    productReviews: 156,
    status: "approved",
    views: 4320,
    likes: []
  },
  {
    title: "Kitchen Essentials",
    description: "Upgrade your cooking experience with our premium kitchen appliances",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
    duration: 40,
    fileSize: 2621440, // 2.5MB
    productName: "Smart Air Fryer",
    productPrice: "₹8,999",
    productImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
    productCategory: "Kitchen",
    productRating: 4.7,
    productReviews: 445,
    status: "approved",
    views: 9870,
    likes: []
  }
];

async function seedVideoData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find a user to assign as uploader (or create a demo user)
    let demoUser = await User.findOne({ email: 'demo@intellibazar.com' });
    
    if (!demoUser) {
      demoUser = new User({
        username: 'DemoUser',
        email: 'demo@intellibazar.com',
        password: 'hashedpassword', // In real app, this would be properly hashed
        role: 'user'
      });
      await demoUser.save();
      console.log('Created demo user');
    }

    // Clear existing video data
    await VideoAd.deleteMany({});
    console.log('Cleared existing video data');

    // Add uploadedBy field to each video
    const videosWithUploader = sampleVideos.map(video => ({
      ...video,
      uploadedBy: demoUser._id
    }));

    // Insert sample videos
    const insertedVideos = await VideoAd.insertMany(videosWithUploader);
    console.log(`Inserted ${insertedVideos.length} sample videos`);

    // Add some sample likes to videos
    for (let i = 0; i < insertedVideos.length; i++) {
      const video = insertedVideos[i];
      const likeCount = Math.floor(Math.random() * 100) + 10; // 10-110 likes
      
      // Add demo user as one of the likers
      video.likes.push({ user: demoUser._id });
      
      // Add some random likes (in real app, these would be real user IDs)
      for (let j = 1; j < likeCount; j++) {
        video.likes.push({ 
          user: new mongoose.Types.ObjectId(),
          likedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
        });
      }
      
      await video.save();
    }

    console.log('Added sample likes to videos');
    console.log('Video data seeding completed successfully!');
    
    // Display summary
    const totalVideos = await VideoAd.countDocuments();
    console.log(`\nSummary:`);
    console.log(`- Total videos in database: ${totalVideos}`);
    console.log(`- Demo user ID: ${demoUser._id}`);
    console.log(`- All videos are approved and ready for viewing`);
    
  } catch (error) {
    console.error('Error seeding video data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
if (require.main === module) {
  seedVideoData();
}

module.exports = { seedVideoData, sampleVideos };
