const mongoose = require('mongoose');
const AdminUser = require('../models/AdminUser');
require('dotenv').config();

async function createSuperAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await AdminUser.findOne({ adminLevel: 'super_admin' });
    
    if (existingSuperAdmin) {
      console.log('⚠️  Super admin already exists:');
      console.log(`   👤 Username: ${existingSuperAdmin.adminUsername}`);
      console.log(`   📧 Email: ${existingSuperAdmin.adminEmail}`);
      console.log(`   👨‍💼 Name: ${existingSuperAdmin.fullName}`);
      console.log(`   🏢 Department: ${existingSuperAdmin.department}`);
      console.log(`   ✅ Active: ${existingSuperAdmin.isActive}`);
      console.log(`   ✅ Approved: ${existingSuperAdmin.isApproved}`);
      
      const answer = await askQuestion('\nDo you want to create another super admin? (y/N): ');
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('👋 Exiting...');
        process.exit(0);
      }
    }

    console.log('\n🔧 Creating Super Admin Account');
    console.log('=====================================');

    // Get admin details from command line or use defaults
    const adminData = {
      adminUsername: process.argv[2] || 'superadmin',
      adminEmail: process.argv[3] || 'admin@intellibazar.com',
      adminPassword: process.argv[4] || 'SuperAdmin123!',
      fullName: process.argv[5] || 'Super Administrator',
      department: process.argv[6] || 'Management',
      phoneNumber: process.argv[7] || '+1234567890'
    };

    // Validate admin username and email don't exist
    const existingAdmin = await AdminUser.findOne({
      $or: [
        { adminUsername: adminData.adminUsername },
        { adminEmail: adminData.adminEmail }
      ]
    });

    if (existingAdmin) {
      console.log('❌ Admin username or email already exists');
      console.log('   Please choose different credentials');
      process.exit(1);
    }

    // Create super admin
    const superAdmin = new AdminUser({
      adminUsername: adminData.adminUsername,
      adminEmail: adminData.adminEmail,
      adminPassword: adminData.adminPassword,
      fullName: adminData.fullName,
      department: adminData.department,
      phoneNumber: adminData.phoneNumber,
      adminLevel: 'super_admin',
      isActive: true,
      isApproved: true,
      approvedAt: new Date(),
      permissions: [
        'manage_products',
        'manage_users', 
        'manage_orders',
        'manage_sellers',
        'view_analytics',
        'manage_admins',
        'system_settings'
      ]
    });

    await superAdmin.save();

    console.log('🎉 Super Admin created successfully!');
    console.log('=====================================');
    console.log(`👤 Username: ${superAdmin.adminUsername}`);
    console.log(`📧 Email: ${superAdmin.adminEmail}`);
    console.log(`🔑 Password: ${adminData.adminPassword}`);
    console.log(`👨‍💼 Name: ${superAdmin.fullName}`);
    console.log(`🏢 Department: ${superAdmin.department}`);
    console.log(`📱 Phone: ${superAdmin.phoneNumber}`);
    console.log(`🔐 Level: ${superAdmin.adminLevel}`);
    console.log(`✅ Status: Active & Approved`);
    console.log('');
    console.log('🚀 You can now access the admin dashboard at:');
    console.log('   http://localhost:5173/admin');
    console.log('');
    console.log('🔒 Login with these credentials:');
    console.log(`   Username: ${superAdmin.adminUsername}`);
    console.log(`   Password: ${adminData.adminPassword}`);
    console.log('');
    console.log('⚠️  IMPORTANT: Please change the default password after first login!');

  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    
    if (error.code === 11000) {
      console.log('💡 This error usually means the username or email already exists.');
      console.log('   Try using different credentials.');
    }
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Helper function to ask questions (for interactive mode)
function askQuestion(question) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Show usage if no arguments provided
if (process.argv.length === 2) {
  console.log('🔧 Super Admin Creation Script');
  console.log('==============================');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/create-super-admin.js [username] [email] [password] [fullName] [department] [phone]');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/create-super-admin.js');
  console.log('  node scripts/create-super-admin.js admin admin@company.com SecurePass123 "John Doe" IT "+1234567890"');
  console.log('');
  console.log('Default values:');
  console.log('  Username: superadmin');
  console.log('  Email: admin@intellibazar.com');
  console.log('  Password: SuperAdmin123!');
  console.log('  Full Name: Super Administrator');
  console.log('  Department: Management');
  console.log('  Phone: +1234567890');
  console.log('');
  console.log('Press Enter to continue with defaults or Ctrl+C to exit...');
  
  process.stdin.once('data', () => {
    createSuperAdmin();
  });
} else {
  createSuperAdmin();
}

module.exports = createSuperAdmin;
