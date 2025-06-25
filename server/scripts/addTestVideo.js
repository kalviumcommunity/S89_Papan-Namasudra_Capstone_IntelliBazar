const mongoose = require('mongoose');
const VideoAd = require('../models/VideoAd');
const User = require('../models/User');
require('dotenv').config();

// Single test video with guaranteed working URL
const testVideo = {
  title: "Test Video - Smartphone Demo",
  description: "This is a test video to verify video playback functionality",
  videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  thumbnailUrl: "https://via.placeholder.com/400x600/1f2937/ffffff?text=Test+Video",
  duration: 10,
  fileSize: 788493,
  productName: "Test Smartphone",
  productPrice: "₹99,999",
  productImage: "https://via.placeholder.com/400x400/374151/ffffff?text=Test+Phone",
  productCategory: "Electronics",
  productRating: 4.5,
  productReviews: 100,
  status: "approved",
  views: 1000,
  likes: []
};

async function addTestVideo() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected successfully');

    // Find or create demo user
    let demoUser = await User.findOne({ email: 'demo@intellibazar.com' });
    
    if (!demoUser) {
      demoUser = new User({
        username: 'DemoUser',
        email: 'demo@intellibazar.com',
        password: 'hashedpassword',
        role: 'user'
      });
      await demoUser.save();
      console.log('👤 Created demo user');
    }

    // Clear existing videos
    await VideoAd.deleteMany({});
    console.log('🗑️ Cleared existing videos');

    // Add test video
    const videoWithUploader = {
      ...testVideo,
      uploadedBy: demoUser._id
    };

    const insertedVideo = await VideoAd.create(videoWithUploader);
    console.log('📹 Added test video');

    // Add some likes
    insertedVideo.likes.push({ user: demoUser._id });
    for (let i = 0; i < 25; i++) {
      insertedVideo.likes.push({ 
        user: new mongoose.Types.ObjectId(),
        likedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      });
    }
    await insertedVideo.save();

    console.log('❤️ Added likes to video');
    console.log('\n🎉 SUCCESS! Test video added');
    console.log('=' * 40);
    console.log(`📹 Video: ${testVideo.title}`);
    console.log(`🔗 URL: ${testVideo.videoUrl}`);
    console.log(`👤 User: ${demoUser.email}`);
    console.log('\n🚀 Test at: http://localhost:5174/Shorts');
    console.log('🔧 Debug at: http://localhost:5174/video-test');
    
    // Test the video URL
    console.log('\n🔍 Testing video URL...');
    const https = require('https');
    const { URL } = require('url');
    
    const urlObj = new URL(testVideo.videoUrl);
    const req = https.request(testVideo.videoUrl, { method: 'HEAD' }, (res) => {
      console.log(`✅ Video URL accessible: ${res.statusCode}`);
      console.log(`📊 Content-Type: ${res.headers['content-type']}`);
      console.log(`📏 Content-Length: ${res.headers['content-length']} bytes`);
    });
    
    req.on('error', (error) => {
      console.log(`❌ Video URL error: ${error.message}`);
    });
    
    req.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    setTimeout(async () => {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    }, 2000);
  }
}

if (require.main === module) {
  addTestVideo();
}

module.exports = { addTestVideo, testVideo };
