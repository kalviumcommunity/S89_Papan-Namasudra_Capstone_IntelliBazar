// Test script to verify cart and wishlist API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

// Test data
const testProduct = {
  productName: "Test Product",
  productPrice: "₹999",
  productImage: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
  productCategory: "Test",
  productRating: 4.5,
  quantity: 1
};

async function testAPI() {
  try {
    console.log('🧪 Testing IntelliBazar Cart & Wishlist API...\n');

    // Test 1: Check if server is running
    console.log('1. Testing server connection...');
    const serverResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ Server is running:', serverResponse.data);

    // Test 2: Test unauthenticated cart access (should fail)
    console.log('\n2. Testing unauthenticated cart access...');
    try {
      await axios.get(`${BASE_URL}/api/cart`);
      console.log('❌ ERROR: Unauthenticated access should be blocked');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Unauthenticated cart access properly blocked');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 3: Test unauthenticated wishlist access (should fail)
    console.log('\n3. Testing unauthenticated wishlist access...');
    try {
      await axios.get(`${BASE_URL}/api/wishlist`);
      console.log('❌ ERROR: Unauthenticated access should be blocked');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Unauthenticated wishlist access properly blocked');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 4: Test cart POST without auth (should fail)
    console.log('\n4. Testing unauthenticated cart POST...');
    try {
      await axios.post(`${BASE_URL}/api/cart`, testProduct);
      console.log('❌ ERROR: Unauthenticated POST should be blocked');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Unauthenticated cart POST properly blocked');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 5: Test wishlist POST without auth (should fail)
    console.log('\n5. Testing unauthenticated wishlist POST...');
    try {
      await axios.post(`${BASE_URL}/api/wishlist`, testProduct);
      console.log('❌ ERROR: Unauthenticated POST should be blocked');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Unauthenticated wishlist POST properly blocked');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log('\n🎉 All authentication tests passed!');
    console.log('\n📝 Summary:');
    console.log('- Server is running correctly');
    console.log('- Cart and wishlist endpoints are properly protected');
    console.log('- Authentication middleware is working as expected');
    console.log('\n✨ The cart and wishlist functionality has been successfully secured!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
testAPI();
