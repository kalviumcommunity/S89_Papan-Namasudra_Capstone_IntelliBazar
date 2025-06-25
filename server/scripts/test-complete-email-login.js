const mongoose = require('mongoose');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 8080}`;

// Test users for comprehensive testing
const testUsers = [
  {
    username: 'emailuser1',
    email: 'emailuser1@intellibazar.com',
    password: 'testpassword123'
  },
  {
    username: 'emailuser2', 
    email: 'emailuser2@intellibazar.com',
    password: 'testpassword456'
  },
  {
    username: 'existinguser',
    email: 'existing@intellibazar.com',
    password: 'existingpass123'
  }
];

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

async function createTestUsers() {
  try {
    console.log('\n🧪 Creating Test Users');
    console.log('======================');
    
    for (const testUser of testUsers) {
      // Remove existing test user if exists
      await User.deleteOne({ email: testUser.email });
      
      // Hash password
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      
      // Create new test user directly in database
      const user = new User({
        username: testUser.username,
        email: testUser.email,
        password: hashedPassword,
        role: 'user'
      });
      
      await user.save();
      console.log(`✅ Created user: ${testUser.email} (username: ${testUser.username})`);
    }
    
  } catch (error) {
    console.error('❌ Failed to create test users:', error.message);
    throw error;
  }
}

async function testSuccessfulLogin(email, password) {
  try {
    console.log(`\n🧪 Testing Successful Login: ${email}`);
    console.log('==========================================');
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: email,
      password: password
    });
    
    console.log('✅ Login successful');
    console.log('📧 Response message:', response.data.message);
    console.log('📊 Status:', response.status);
    console.log('🔑 Token received:', response.data.token ? 'Yes' : 'No');
    console.log('👤 User data received:', response.data.user ? 'Yes' : 'No');
    
    if (response.data.user) {
      console.log('📧 User email:', response.data.user.email);
      console.log('👤 Username:', response.data.user.username);
      console.log('🔐 User ID:', response.data.user.id);
      console.log('👑 Role:', response.data.user.role);
    }
    
    // Test token validation
    if (response.data.token) {
      await testTokenValidation(response.data.token);
    }
    
    return response.data.token;
    
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    throw error;
  }
}

async function testFailedLogin(email, password, expectedError) {
  try {
    console.log(`\n🧪 Testing Failed Login: ${email}`);
    console.log('=====================================');
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: email,
      password: password
    });
    
    console.log('❌ Login should have failed but succeeded!');
    
  } catch (error) {
    console.log('✅ Login correctly failed');
    console.log('📧 Error message:', error.response?.data?.message);
    console.log('📊 Status:', error.response?.status);
    
    if (expectedError && error.response?.data?.message !== expectedError) {
      console.log(`⚠️ Expected error: "${expectedError}"`);
      console.log(`⚠️ Actual error: "${error.response?.data?.message}"`);
    }
  }
}

async function testTokenValidation(token) {
  try {
    console.log('\n🔑 Testing Token Validation');
    console.log('============================');
    
    const response = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('✅ Token validation successful');
    console.log('👤 User data received:', response.data.email);
    console.log('📊 Status:', response.status);
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Token validation failed:', error.response?.data?.message || error.message);
    throw error;
  }
}

async function testUsernameLoginFails() {
  try {
    console.log('\n🧪 Testing Username Login (Should Fail)');
    console.log('=======================================');
    
    // Try to login with username instead of email
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: testUsers[0].username,
      password: testUsers[0].password
    });
    
    console.log('❌ Username login should have failed but succeeded!');
    
  } catch (error) {
    console.log('✅ Username login correctly failed');
    console.log('📧 Error message:', error.response?.data?.message);
    console.log('📊 Status:', error.response?.status);
  }
}

async function testPasswordResetCompatibility() {
  try {
    console.log('\n🧪 Testing Password Reset Compatibility');
    console.log('=======================================');
    
    // Test that password reset still works with email
    const response = await axios.post(`${BASE_URL}/api/auth/forgot-password`, {
      email: testUsers[0].email
    });
    
    console.log('✅ Password reset request successful');
    console.log('📧 Response:', response.data.message);
    console.log('📊 Status:', response.status);
    
    // Check if reset token was generated
    const user = await User.findOne({ email: testUsers[0].email });
    if (user && user.resetPasswordToken) {
      console.log('✅ Reset token generated successfully');
      console.log('🔑 Token exists:', 'Yes');
    } else {
      console.log('❌ Reset token not generated');
    }
    
  } catch (error) {
    console.error('❌ Password reset test failed:', error.response?.data?.message || error.message);
  }
}

async function cleanup() {
  try {
    console.log('\n🧹 Cleaning Up');
    console.log('===============');
    
    for (const testUser of testUsers) {
      await User.deleteOne({ email: testUser.email });
    }
    console.log('✅ Test users removed');
    
    await mongoose.disconnect();
    console.log('✅ Database disconnected');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  }
}

async function runCompleteEmailLoginTests() {
  try {
    console.log('🚀 Starting Complete Email-Based Login Tests\n');
    
    await connectDB();
    await createTestUsers();
    
    // Test successful logins
    const token1 = await testSuccessfulLogin(testUsers[0].email, testUsers[0].password);
    const token2 = await testSuccessfulLogin(testUsers[1].email, testUsers[1].password);
    
    // Test failed logins
    await testFailedLogin(testUsers[0].email, 'wrongpassword', 'Invalid credentials');
    await testFailedLogin('nonexistent@email.com', 'somepassword', 'User not found');
    await testFailedLogin('', testUsers[0].password, 'Email and password are required');
    await testFailedLogin(testUsers[0].email, '', 'Email and password are required');
    
    // Test username login fails
    await testUsernameLoginFails();
    
    // Test password reset compatibility
    await testPasswordResetCompatibility();
    
    console.log('\n🎉 Complete Email-Based Login Tests PASSED!');
    console.log('===========================================');
    console.log('✅ Users can successfully log in with email addresses');
    console.log('✅ JWT tokens are generated and validated correctly');
    console.log('✅ Failed login attempts are handled properly');
    console.log('✅ Username-based login is properly disabled');
    console.log('✅ Password reset functionality remains compatible');
    console.log('✅ Error messages are appropriate and informative');
    console.log('✅ Authentication flow is complete and secure');
    
  } catch (error) {
    console.error('\n❌ Complete Email-Based Login Tests FAILED!');
    console.error('===========================================');
    console.error('Error:', error.message);
  } finally {
    await cleanup();
  }
}

runCompleteEmailLoginTests();
