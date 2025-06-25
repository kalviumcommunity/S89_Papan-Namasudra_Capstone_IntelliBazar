#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of files that need to be fixed
const filesToFix = [
  'client/src/pages/Watches.jsx',
  'client/src/pages/Footwear.jsx', 
  'client/src/pages/NewArrivals.jsx',
  'client/src/pages/SpecialOffers.jsx',
  'client/src/pages/Books.jsx',
  'client/src/pages/Sports.jsx',
  'client/src/pages/Kitchen.jsx',
  'client/src/pages/Checkout.jsx'
];

// Function to fix a single file
function fixFile(filePath) {
  console.log(`Fixing ${filePath}...`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file already imports renderStars
    if (content.includes('import { renderStars }')) {
      console.log(`  ✅ ${filePath} already fixed`);
      return;
    }
    
    // Remove FaStar and FaRegStar from imports and add renderStars import
    content = content.replace(
      /import\s+{([^}]*FaStar[^}]*FaRegStar[^}]*|[^}]*FaRegStar[^}]*FaStar[^}]*)}\s+from\s+"react-icons\/fa";/,
      (match, imports) => {
        // Remove FaStar and FaRegStar from imports
        const cleanedImports = imports
          .split(',')
          .map(imp => imp.trim())
          .filter(imp => !imp.includes('FaStar') && !imp.includes('FaRegStar'))
          .join(', ');
        
        return `import { ${cleanedImports} } from "react-icons/fa";`;
      }
    );
    
    // Add renderStars import after the last import
    const lastImportIndex = content.lastIndexOf('import ');
    const nextLineIndex = content.indexOf('\n', lastImportIndex);
    content = content.slice(0, nextLineIndex) + 
              '\nimport { renderStars } from "../utils/starRating";' + 
              content.slice(nextLineIndex);
    
    // Remove the renderStars function definition
    content = content.replace(
      /\/\/\s*Render star rating[\s\S]*?const renderStars = \(rating\) => {[\s\S]*?};/,
      ''
    );
    
    // Write the fixed content back
    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Fixed ${filePath}`);
    
  } catch (error) {
    console.error(`  ❌ Error fixing ${filePath}:`, error.message);
  }
}

// Fix all files
console.log('🔧 Fixing star rating components...\n');

filesToFix.forEach(fixFile);

console.log('\n✅ All files processed!');
console.log('\n📝 Manual verification needed for:');
console.log('- Import statements may need cleanup');
console.log('- renderStars usage should work with new utility');
console.log('- Test each page to ensure no errors');
