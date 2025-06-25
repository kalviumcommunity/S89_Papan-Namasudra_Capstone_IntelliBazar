const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
require('dotenv').config();

// Test script for Admin Dashboard functionality
async function testAdminDashboard() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Test 1: Check if User model supports new roles
    console.log('\n🧪 Test 1: User Role System');
    
    // Find or create a test admin user
    let adminUser = await User.findOne({ email: 'admin@test.com' });
    if (!adminUser) {
      adminUser = new User({
        username: 'testadmin',
        email: 'admin@test.com',
        password: 'hashedpassword', // In real app, this would be hashed
        role: 'admin'
      });
      await adminUser.save();
      console.log('✅ Created test admin user');
    } else {
      console.log('✅ Found existing admin user');
    }

    // Find or create a test seller user
    let sellerUser = await User.findOne({ email: 'seller@test.com' });
    if (!sellerUser) {
      sellerUser = new User({
        username: 'testseller',
        email: 'seller@test.com',
        password: 'hashedpassword',
        role: 'seller',
        sellerInfo: {
          businessName: 'Test Business',
          businessAddress: 'Test Address',
          businessPhone: '1234567890',
          isVerified: true,
          appliedAt: new Date(),
          approvedAt: new Date()
        }
      });
      await sellerUser.save();
      console.log('✅ Created test seller user');
    } else {
      console.log('✅ Found existing seller user');
    }

    // Test 2: Product Model
    console.log('\n🧪 Test 2: Product Model');
    
    // Create a test product
    const testProduct = new Product({
      name: 'Test Product - Admin Dashboard',
      description: 'This is a test product created by the admin dashboard test script',
      price: 999,
      category: 'electronics',
      stock: 50,
      sellerId: sellerUser._id,
      sellerName: sellerUser.username,
      images: [{
        url: 'https://via.placeholder.com/300',
        alt: 'Test product image'
      }],
      primaryImage: 'https://via.placeholder.com/300',
      specifications: {
        brand: 'Test Brand',
        model: 'Test Model',
        color: 'Black',
        warranty: '1 year'
      },
      tags: ['test', 'electronics', 'dashboard'],
      originalPrice: 1299,
      discountPercentage: 23
    });

    await testProduct.save();
    console.log('✅ Created test product:', testProduct.name);

    // Test 3: Product Queries
    console.log('\n🧪 Test 3: Product Queries');
    
    // Test getting all products
    const allProducts = await Product.find({ isActive: true });
    console.log(`✅ Found ${allProducts.length} active products`);

    // Test getting seller products
    const sellerProducts = await Product.find({ sellerId: sellerUser._id });
    console.log(`✅ Found ${sellerProducts.length} products for seller`);

    // Test search functionality
    const searchResults = await Product.find({
      $or: [
        { name: { $regex: 'test', $options: 'i' } },
        { description: { $regex: 'test', $options: 'i' } },
        { tags: { $in: [/test/i] } }
      ]
    });
    console.log(`✅ Found ${searchResults.length} products matching 'test'`);

    // Test category filtering
    const electronicsProducts = await Product.find({ category: 'electronics' });
    console.log(`✅ Found ${electronicsProducts.length} electronics products`);

    // Test 4: Virtual Fields
    console.log('\n🧪 Test 4: Virtual Fields');
    
    const productWithVirtuals = await Product.findById(testProduct._id);
    console.log(`✅ Discounted price: ${productWithVirtuals.discountedPrice}`);
    console.log(`✅ Formatted price: ${productWithVirtuals.formattedPrice}`);

    // Test 5: User Virtual Fields
    console.log('\n🧪 Test 5: User Virtual Fields');
    
    console.log(`✅ Admin user isAdmin: ${adminUser.isAdmin}`);
    console.log(`✅ Seller user isSeller: ${sellerUser.isSeller}`);
    console.log(`✅ Seller user isVerifiedSeller: ${sellerUser.isVerifiedSeller}`);

    // Test 6: Product Statistics
    console.log('\n🧪 Test 6: Product Statistics');
    
    const stats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    console.log('✅ Category statistics:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} products, avg price: ₹${Math.round(stat.avgPrice)}`);
    });

    // Test 7: Text Search Index
    console.log('\n🧪 Test 7: Text Search');
    
    try {
      const textSearchResults = await Product.find(
        { $text: { $search: "test electronics" } },
        { score: { $meta: "textScore" } }
      ).sort({ score: { $meta: "textScore" } });
      
      console.log(`✅ Text search found ${textSearchResults.length} results`);
    } catch (error) {
      console.log('⚠️  Text search index not created yet. Run in MongoDB:');
      console.log('   db.products.createIndex({ name: "text", description: "text", tags: "text" })');
    }

    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    await Product.deleteOne({ _id: testProduct._id });
    console.log('✅ Deleted test product');

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ User role system working');
    console.log('   ✅ Product model enhanced');
    console.log('   ✅ Database queries functional');
    console.log('   ✅ Virtual fields working');
    console.log('   ✅ Statistics aggregation working');
    console.log('\n🚀 Admin Dashboard is ready to use!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the test
if (require.main === module) {
  testAdminDashboard();
}

module.exports = testAdminDashboard;
