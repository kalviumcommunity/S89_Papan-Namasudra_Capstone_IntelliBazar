const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function listUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find({}, 'email username role createdAt');
    
    console.log(`\n👥 Found ${users.length} users in the database:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. 📧 Email: ${user.email}`);
      console.log(`   👤 Username: ${user.username || 'Not set'}`);
      console.log(`   🔑 Role: ${user.role}`);
      console.log(`   📅 Created: ${user.createdAt.toLocaleDateString()}`);
      console.log('');
    });

    if (users.length === 0) {
      console.log('❌ No users found. Please sign up first at http://localhost:5173/signup');
    } else {
      console.log('💡 To make a user admin, run:');
      console.log('   node scripts/make-admin.js <email>');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the script
listUsers();
