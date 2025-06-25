// Debug script to check authentication status
console.log("🔍 Debugging Authentication Status...");

// Check if we're in browser environment
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  // Check for token in localStorage
  const token = localStorage.getItem('token');
  console.log("🔑 Token in localStorage:", token ? "EXISTS" : "NOT FOUND");
  
  if (token) {
    console.log("📝 Token preview:", token.substring(0, 20) + "...");
    
    // Try to decode JWT payload (basic check)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log("👤 Token payload:", payload);
      console.log("⏰ Token expiry:", new Date(payload.exp * 1000));
      console.log("🕐 Current time:", new Date());
      console.log("✅ Token valid:", payload.exp * 1000 > Date.now());
    } catch (e) {
      console.log("❌ Error decoding token:", e.message);
    }
  }
  
  // Check for user data
  const userData = localStorage.getItem('user');
  console.log("👤 User data in localStorage:", userData ? "EXISTS" : "NOT FOUND");
  
  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log("👤 User info:", user);
    } catch (e) {
      console.log("❌ Error parsing user data:", e.message);
    }
  }
} else {
  console.log("❌ Not in browser environment");
}

// Instructions for manual testing
console.log(`
🧪 Manual Testing Instructions:
1. Open browser console (F12)
2. Paste this script and run it
3. Check the output for authentication status
4. Try adding items to cart/wishlist and check console for errors
5. Check Network tab for API requests when clicking buttons
`);
