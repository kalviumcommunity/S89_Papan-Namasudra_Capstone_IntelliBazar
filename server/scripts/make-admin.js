const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function makeUserAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get user email from command line argument
    const email = process.argv[2];
    
    if (!email) {
      console.log('❌ Please provide an email address');
      console.log('Usage: node scripts/make-admin.js your-email@example.com');
      process.exit(1);
    }

    // Find the user
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      console.log('Available users:');
      const allUsers = await User.find({}, 'email username role');
      allUsers.forEach(u => {
        console.log(`   📧 ${u.email} (${u.username}) - Role: ${u.role}`);
      });
      process.exit(1);
    }

    // Update user role to admin
    user.role = 'admin';
    await user.save();

    console.log(`✅ Successfully updated ${email} to admin role`);
    console.log(`👤 User: ${user.username} (${user.email})`);
    console.log(`🔑 Role: ${user.role}`);
    console.log('\n🎉 You can now access the admin dashboard!');
    console.log('📍 Go to: http://localhost:5173/admin');
    console.log('🔄 Or refresh the page and check the user dropdown menu');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the script
makeUserAdmin();
