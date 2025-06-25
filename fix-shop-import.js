// Quick fix to add useAuth import to Shop.jsx
const fs = require('fs');
const path = require('path');

const shopFilePath = path.join(__dirname, 'client', 'src', 'pages', 'Shop.jsx');

try {
  let content = fs.readFileSync(shopFilePath, 'utf8');
  
  // Check if useAuth import already exists
  if (content.includes('import { useAuth }')) {
    console.log('✅ useAuth import already exists');
    return;
  }
  
  // Add the useAuth import after the useWishlist import
  content = content.replace(
    'import { useWishlist } from "../context/WishlistContext";',
    'import { useWishlist } from "../context/WishlistContext";\nimport { useAuth } from "../context/AuthContext";'
  );
  
  fs.writeFileSync(shopFilePath, content);
  console.log('✅ Successfully added useAuth import to Shop.jsx');
  
} catch (error) {
  console.error('❌ Error fixing Shop.jsx:', error.message);
}
