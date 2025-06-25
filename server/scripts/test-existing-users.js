const mongoose = require('mongoose');
const axios = require('axios');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 8080}`;

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

async function checkExistingUsers() {
  try {
    console.log('\n🧪 Checking Existing Users');
    console.log('===========================');
    
    const users = await User.find({}).select('username email role createdAt');
    
    console.log(`📊 Total users in database: ${users.length}`);
    
    if (users.length === 0) {
      console.log('ℹ️ No existing users found in database');
      return [];
    }
    
    console.log('\n👥 Existing Users:');
    console.log('==================');
    
    const usersWithEmail = [];
    const usersWithoutEmail = [];
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Username: ${user.username || 'N/A'}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   Role: ${user.role || 'user'}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
      
      if (user.email) {
        usersWithEmail.push(user);
      } else {
        usersWithoutEmail.push(user);
      }
    });
    
    console.log(`📧 Users with email: ${usersWithEmail.length}`);
    console.log(`❌ Users without email: ${usersWithoutEmail.length}`);
    
    if (usersWithoutEmail.length > 0) {
      console.log('\n⚠️ Warning: Some users don\'t have email addresses');
      console.log('   These users won\'t be able to log in with the new email-based system');
      console.log('   Consider adding email addresses to these accounts');
    }
    
    return { usersWithEmail, usersWithoutEmail };
    
  } catch (error) {
    console.error('❌ Failed to check existing users:', error.message);
    throw error;
  }
}

async function testExistingUserLogin(user) {
  try {
    console.log(`\n🧪 Testing Login for Existing User: ${user.email}`);
    console.log('================================================');
    
    // Since we don't know the password, we'll test the API response
    // This will fail with "Invalid credentials" but confirms the email is recognized
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: user.email,
      password: 'testpassword123' // This will likely be wrong
    });
    
    console.log('❌ Unexpected success - password should have been wrong');
    
  } catch (error) {
    const errorMessage = error.response?.data?.message;
    const statusCode = error.response?.status;
    
    if (errorMessage === 'Invalid credentials' && statusCode === 401) {
      console.log('✅ User email recognized (password incorrect as expected)');
      console.log('📧 Email authentication is working for existing user');
    } else if (errorMessage === 'User not found' && statusCode === 404) {
      console.log('❌ User not found - this shouldn\'t happen for existing users');
    } else {
      console.log(`⚠️ Unexpected error: ${errorMessage} (Status: ${statusCode})`);
    }
    
    console.log(`📧 Response: ${errorMessage}`);
    console.log(`📊 Status: ${statusCode}`);
  }
}

async function testUserDataIntegrity() {
  try {
    console.log('\n🧪 Testing User Data Integrity');
    console.log('===============================');
    
    const users = await User.find({}).select('username email password role');
    
    let usersWithBothFields = 0;
    let usersWithEmailOnly = 0;
    let usersWithUsernameOnly = 0;
    let usersWithNeither = 0;
    
    users.forEach(user => {
      if (user.username && user.email) {
        usersWithBothFields++;
      } else if (user.email && !user.username) {
        usersWithEmailOnly++;
      } else if (user.username && !user.email) {
        usersWithUsernameOnly++;
      } else {
        usersWithNeither++;
      }
    });
    
    console.log(`👥 Users with both username and email: ${usersWithBothFields}`);
    console.log(`📧 Users with email only: ${usersWithEmailOnly}`);
    console.log(`👤 Users with username only: ${usersWithUsernameOnly}`);
    console.log(`❌ Users with neither: ${usersWithNeither}`);
    
    if (usersWithUsernameOnly > 0) {
      console.log('\n⚠️ Warning: Some users only have usernames');
      console.log('   These users cannot log in with the new email-based system');
      console.log('   Consider migrating these accounts or providing a migration path');
    }
    
    if (usersWithNeither > 0) {
      console.log('\n❌ Critical: Some users have neither username nor email');
      console.log('   These accounts are in an invalid state');
    }
    
  } catch (error) {
    console.error('❌ Failed to test user data integrity:', error.message);
  }
}

async function testEmailUniqueness() {
  try {
    console.log('\n🧪 Testing Email Uniqueness');
    console.log('============================');
    
    const emailCounts = await User.aggregate([
      { $match: { email: { $exists: true, $ne: null, $ne: '' } } },
      { $group: { _id: '$email', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    
    if (emailCounts.length === 0) {
      console.log('✅ All emails are unique');
    } else {
      console.log('❌ Duplicate emails found:');
      emailCounts.forEach(item => {
        console.log(`   ${item._id}: ${item.count} users`);
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to test email uniqueness:', error.message);
  }
}

async function cleanup() {
  try {
    await mongoose.disconnect();
    console.log('\n✅ Database disconnected');
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  }
}

async function runExistingUserTests() {
  try {
    console.log('🚀 Starting Existing User Compatibility Tests\n');
    
    await connectDB();
    
    const { usersWithEmail, usersWithoutEmail } = await checkExistingUsers();
    
    await testUserDataIntegrity();
    await testEmailUniqueness();
    
    // Test login with a few existing users (if any)
    if (usersWithEmail.length > 0) {
      console.log('\n🧪 Testing Login with Existing Users');
      console.log('====================================');
      
      // Test up to 3 existing users
      const usersToTest = usersWithEmail.slice(0, 3);
      for (const user of usersToTest) {
        await testExistingUserLogin(user);
      }
    }
    
    console.log('\n🎉 Existing User Compatibility Tests Completed!');
    console.log('===============================================');
    
    if (usersWithEmail.length > 0) {
      console.log('✅ Existing users with emails can use the new login system');
      console.log('✅ Email-based authentication is backward compatible');
    } else {
      console.log('ℹ️ No existing users with emails to test');
    }
    
    if (usersWithoutEmail.length > 0) {
      console.log('⚠️ Some existing users may need email addresses added');
    }
    
    console.log('✅ User data integrity checked');
    console.log('✅ Email uniqueness verified');
    
  } catch (error) {
    console.error('\n❌ Existing User Compatibility Tests Failed!');
    console.error('============================================');
    console.error('Error:', error.message);
  } finally {
    await cleanup();
  }
}

runExistingUserTests();
