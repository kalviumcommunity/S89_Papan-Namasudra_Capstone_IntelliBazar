import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const DebugAuth = () => {
  const { user } = useAuth();
  const { addToCart, cartItems, cartCount } = useCart();
  const { addToWishlist, wishlistItems, wishlistCount } = useWishlist();

  const testProduct = {
    name: "Test Product",
    price: "₹999",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
    category: "Test",
    rating: 4.5,
    reviews: 10
  };

  const handleTestCart = async () => {
    console.log("🧪 Testing cart functionality...");
    console.log("👤 User:", user);
    console.log("🛒 Current cart items:", cartItems);
    
    if (!user) {
      alert("❌ User not authenticated!");
      return;
    }

    try {
      const success = await addToCart(testProduct);
      console.log("✅ Cart test result:", success);
      if (success) {
        alert("✅ Test product added to cart successfully!");
      } else {
        alert("❌ Failed to add test product to cart");
      }
    } catch (error) {
      console.error("❌ Cart test error:", error);
      alert("❌ Cart test failed: " + error.message);
    }
  };

  const handleTestWishlist = async () => {
    console.log("🧪 Testing wishlist functionality...");
    console.log("👤 User:", user);
    console.log("❤️ Current wishlist items:", wishlistItems);
    
    if (!user) {
      alert("❌ User not authenticated!");
      return;
    }

    try {
      const success = await addToWishlist(testProduct);
      console.log("✅ Wishlist test result:", success);
      if (success) {
        alert("✅ Test product added to wishlist successfully!");
      } else {
        alert("❌ Failed to add test product to wishlist");
      }
    } catch (error) {
      console.error("❌ Wishlist test error:", error);
      alert("❌ Wishlist test failed: " + error.message);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'white',
      border: '2px solid #ccc',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>🔧 Debug Panel</h3>
      
      <div style={{ marginBottom: '10px', fontSize: '12px' }}>
        <strong>Auth Status:</strong> {user ? '✅ Signed In' : '❌ Not Signed In'}
      </div>
      
      {user && (
        <div style={{ marginBottom: '10px', fontSize: '12px' }}>
          <strong>User:</strong> {user.name || user.email || 'Unknown'}
        </div>
      )}
      
      <div style={{ marginBottom: '10px', fontSize: '12px' }}>
        <strong>Cart Items:</strong> {cartCount}
      </div>
      
      <div style={{ marginBottom: '15px', fontSize: '12px' }}>
        <strong>Wishlist Items:</strong> {wishlistCount}
      </div>
      
      <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
        <button 
          onClick={handleTestCart}
          style={{
            padding: '8px 12px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          🛒 Test Cart
        </button>
        
        <button 
          onClick={handleTestWishlist}
          style={{
            padding: '8px 12px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          ❤️ Test Wishlist
        </button>
      </div>
    </div>
  );
};

export default DebugAuth;
