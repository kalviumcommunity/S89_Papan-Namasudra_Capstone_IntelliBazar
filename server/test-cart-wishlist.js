const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

// Test user credentials
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'testpassword123'
};

// Test product data
const testProduct = {
  productName: 'Test Product',
  productPrice: '₹999',
  productImage: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f',
  productCategory: 'Fashion',
  productRating: 4.5
};

let authToken = '';

async function testCartWishlistFunctionality() {
  try {
    console.log('🧪 Testing IntelliBazar Cart & Wishlist Functionality...\n');

    // Test 1: Check if server is running
    console.log('1. Testing server connection...');
    const serverResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ Server is running:', serverResponse.data);

    // Test 2: Register test user (if not exists)
    console.log('\n2. Registering test user...');
    try {
      await axios.post(`${BASE_URL}/api/auth/signup`, testUser);
      console.log('✅ Test user registered successfully');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('ℹ️ Test user already exists');
      } else {
        throw error;
      }
    }

    // Test 3: Login test user
    console.log('\n3. Logging in test user...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    authToken = loginResponse.data.token;
    console.log('✅ User logged in successfully');

    // Test 4: Test cart functionality
    console.log('\n4. Testing cart functionality...');
    
    // Add item to cart
    const addToCartResponse = await axios.post(`${BASE_URL}/api/cart`, testProduct, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Item added to cart:', addToCartResponse.data.message);

    // Get cart items
    const getCartResponse = await axios.get(`${BASE_URL}/api/cart`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Cart items retrieved:', getCartResponse.data.count, 'items');

    // Test 5: Test wishlist functionality
    console.log('\n5. Testing wishlist functionality...');
    
    // Add item to wishlist
    const addToWishlistResponse = await axios.post(`${BASE_URL}/api/wishlist`, testProduct, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Item added to wishlist:', addToWishlistResponse.data.message);

    // Get wishlist items
    const getWishlistResponse = await axios.get(`${BASE_URL}/api/wishlist`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Wishlist items retrieved:', getWishlistResponse.data.count, 'items');

    // Test 6: Test authentication protection
    console.log('\n6. Testing authentication protection...');
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

    console.log('\n🎉 All tests passed! Cart and Wishlist functionality is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the tests
testCartWishlistFunctionality();
