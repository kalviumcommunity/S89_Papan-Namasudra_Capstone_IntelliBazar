const mongoose = require('mongoose');
const AdminUser = require('../models/AdminUser');
require('dotenv').config();

async function testAdminModel() {
  try {
    console.log('🔧 Testing AdminUser model...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Test finding existing super admin
    console.log('\n🔍 Testing find operation...');
    const existingAdmin = await AdminUser.findOne({ adminUsername: 'superadmin' });
    
    if (existingAdmin) {
      console.log('✅ Found existing super admin:');
      console.log(`   ID: ${existingAdmin._id}`);
      console.log(`   Username: ${existingAdmin.adminUsername}`);
      console.log(`   Email: ${existingAdmin.adminEmail}`);
      console.log(`   Level: ${existingAdmin.adminLevel}`);
      console.log(`   Active: ${existingAdmin.isActive}`);
      console.log(`   Approved: ${existingAdmin.isApproved}`);
      
      // Test password comparison
      console.log('\n🔐 Testing password comparison...');
      try {
        const isValid = await existingAdmin.comparePassword('SuperAdmin123!');
        console.log(`✅ Password comparison result: ${isValid}`);
      } catch (error) {
        console.error('❌ Password comparison error:', error);
      }
      
    } else {
      console.log('❌ No super admin found');
    }

    // Test creating a new admin (will be deleted after test)
    console.log('\n🆕 Testing admin creation...');
    try {
      const testAdmin = new AdminUser({
        adminUsername: 'testadmin_temp',
        adminEmail: 'test@temp.com',
        adminPassword: 'TestPassword123!',
        fullName: 'Test Admin',
        department: 'IT',
        adminLevel: 'admin',
        isActive: true,
        isApproved: true
      });

      await testAdmin.save();
      console.log('✅ Test admin created successfully');
      
      // Test password comparison on new admin
      const isValidNew = await testAdmin.comparePassword('TestPassword123!');
      console.log(`✅ New admin password comparison: ${isValidNew}`);
      
      // Clean up - delete test admin
      await AdminUser.deleteOne({ _id: testAdmin._id });
      console.log('✅ Test admin cleaned up');
      
    } catch (error) {
      console.error('❌ Admin creation error:', error);
      console.error('Error details:', error.message);
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

testAdminModel();
