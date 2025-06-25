const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

// Test user credentials
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'testpassword123'
};

// Test product data
const testProducts = [
  {
    productName: 'Test Product 1',
    productPrice: '₹999',
    productImage: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f',
    productCategory: 'Fashion',
    productRating: 4.5
  },
  {
    productName: 'Test Product 2',
    productPrice: '₹1299',
    productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
    productCategory: 'Electronics',
    productRating: 4.8
  }
];

let authToken = '';

async function testPagesDisplay() {
  try {
    console.log('🧪 Testing Cart & Wishlist Pages Display...\n');

    // Login test user
    console.log('1. Logging in test user...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    authToken = loginResponse.data.token;
    console.log('✅ User logged in successfully');

    // Clear existing data
    console.log('\n2. Clearing existing cart and wishlist...');
    await axios.delete(`${BASE_URL}/api/cart`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    await axios.delete(`${BASE_URL}/api/wishlist`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Existing data cleared');

    // Add items to cart
    console.log('\n3. Adding items to cart...');
    for (const product of testProducts) {
      const response = await axios.post(`${BASE_URL}/api/cart`, product, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(`✅ Added "${product.productName}" to cart`);
    }

    // Add items to wishlist
    console.log('\n4. Adding items to wishlist...');
    for (const product of testProducts) {
      const response = await axios.post(`${BASE_URL}/api/wishlist`, product, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(`✅ Added "${product.productName}" to wishlist`);
    }

    // Verify cart contents
    console.log('\n5. Verifying cart contents...');
    const cartResponse = await axios.get(`${BASE_URL}/api/cart`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ Cart contains ${cartResponse.data.count} items:`);
    cartResponse.data.data.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.productName} - ${item.productPrice} (Qty: ${item.quantity})`);
    });

    // Verify wishlist contents
    console.log('\n6. Verifying wishlist contents...');
    const wishlistResponse = await axios.get(`${BASE_URL}/api/wishlist`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ Wishlist contains ${wishlistResponse.data.count} items:`);
    wishlistResponse.data.data.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.productName} - ${item.productPrice}`);
    });

    // Test cart operations
    console.log('\n7. Testing cart operations...');
    const firstCartItem = cartResponse.data.data[0];
    if (firstCartItem) {
      // Test increment quantity
      await axios.put(`${BASE_URL}/api/cart/${firstCartItem._id}`, 
        { quantity: firstCartItem.quantity + 1 }, 
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log(`✅ Incremented quantity for "${firstCartItem.productName}"`);

      // Test decrement quantity
      await axios.put(`${BASE_URL}/api/cart/${firstCartItem._id}`, 
        { quantity: firstCartItem.quantity }, 
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log(`✅ Decremented quantity for "${firstCartItem.productName}"`);
    }

    // Test wishlist operations
    console.log('\n8. Testing wishlist operations...');
    const firstWishlistItem = wishlistResponse.data.data[0];
    if (firstWishlistItem) {
      // Remove one item from wishlist
      await axios.delete(`${BASE_URL}/api/wishlist/product/${encodeURIComponent(firstWishlistItem.productName)}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(`✅ Removed "${firstWishlistItem.productName}" from wishlist`);

      // Add it back
      await axios.post(`${BASE_URL}/api/wishlist`, firstWishlistItem, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(`✅ Added "${firstWishlistItem.productName}" back to wishlist`);
    }

    console.log('\n🎉 All tests passed! Cart and Wishlist pages should display items correctly.');
    console.log('\n📝 Next steps:');
    console.log('   1. Open http://localhost:5173/cart to view cart page');
    console.log('   2. Open http://localhost:5173/wishlist to view wishlist page');
    console.log('   3. Verify that items are displayed with correct product names, prices, and images');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the tests
testPagesDisplay();
