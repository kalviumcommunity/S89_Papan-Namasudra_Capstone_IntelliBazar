// Enhanced search utility with relevance scoring and better matching

export const searchProducts = (products, searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) {
    return products;
  }

  const term = searchTerm.toLowerCase().trim();
  const searchWords = term.split(/\s+/);

  // Calculate relevance score for each product
  const scoredProducts = products.map(product => {
    let score = 0;
    const productName = product.name.toLowerCase();
    const productCategory = product.category.toLowerCase();
    
    // Exact match in name (highest score)
    if (productName === term) {
      score += 100;
    }
    
    // Exact match in category
    if (productCategory === term) {
      score += 80;
    }
    
    // Name starts with search term
    if (productName.startsWith(term)) {
      score += 60;
    }
    
    // Category starts with search term
    if (productCategory.startsWith(term)) {
      score += 50;
    }
    
    // Name contains search term
    if (productName.includes(term)) {
      score += 40;
    }
    
    // Category contains search term
    if (productCategory.includes(term)) {
      score += 30;
    }
    
    // Check for partial word matches
    searchWords.forEach(word => {
      if (word.length > 2) { // Only consider words longer than 2 characters
        if (productName.includes(word)) {
          score += 20;
        }
        if (productCategory.includes(word)) {
          score += 15;
        }
      }
    });
    
    // Fuzzy matching for typos (simple Levenshtein-like approach)
    if (score === 0) {
      const fuzzyScore = calculateFuzzyScore(productName, term) + 
                        calculateFuzzyScore(productCategory, term);
      if (fuzzyScore > 0.6) {
        score += Math.floor(fuzzyScore * 10);
      }
    }
    
    return { ...product, searchScore: score };
  });

  // Filter products with score > 0 and sort by relevance
  return scoredProducts
    .filter(product => product.searchScore > 0)
    .sort((a, b) => {
      // Primary sort: by search score (descending)
      if (b.searchScore !== a.searchScore) {
        return b.searchScore - a.searchScore;
      }
      // Secondary sort: by rating (descending)
      if (b.rating !== a.rating) {
        return (b.rating || 0) - (a.rating || 0);
      }
      // Tertiary sort: by name (ascending)
      return a.name.localeCompare(b.name);
    });
};

// Simple fuzzy matching algorithm
const calculateFuzzyScore = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) {
    return 1.0;
  }
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

// Levenshtein distance calculation
const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

// Extract search suggestions from products
export const getSearchSuggestions = (products, searchTerm, limit = 5) => {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }

  const term = searchTerm.toLowerCase();
  const suggestions = new Set();
  
  // Add product names that match
  products.forEach(product => {
    const name = product.name.toLowerCase();
    const category = product.category.toLowerCase();
    
    if (name.includes(term)) {
      suggestions.add(product.name);
    }
    
    if (category.includes(term)) {
      suggestions.add(product.category);
    }
  });
  
  return Array.from(suggestions).slice(0, limit);
};

// Get popular search terms (could be enhanced with analytics)
export const getPopularSearches = () => {
  return [
    'Laptop',
    'Smartphone', 
    'Headphones',
    'T-shirt',
    'Sneakers',
    'Watch',
    'Books',
    'Kitchen'
  ];
};

// Save search term to history
export const saveSearchHistory = (searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) return;
  
  const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
  const newHistory = [
    searchTerm.trim(),
    ...history.filter(item => item !== searchTerm.trim())
  ].slice(0, 10); // Keep last 10 searches
  
  localStorage.setItem('searchHistory', JSON.stringify(newHistory));
};

// Get search history
export const getSearchHistory = () => {
  return JSON.parse(localStorage.getItem('searchHistory') || '[]');
};

// Clear search history
export const clearSearchHistory = () => {
  localStorage.removeItem('searchHistory');
};

// Analyze search results for insights
export const analyzeSearchResults = (products, searchTerm) => {
  const results = searchProducts(products, searchTerm);
  
  const analysis = {
    totalResults: results.length,
    categories: {},
    priceRange: { min: Infinity, max: -Infinity },
    avgRating: 0,
    hasResults: results.length > 0
  };
  
  if (results.length === 0) {
    return analysis;
  }
  
  let totalRating = 0;
  let ratedProducts = 0;
  
  results.forEach(product => {
    // Count categories
    analysis.categories[product.category] = 
      (analysis.categories[product.category] || 0) + 1;
    
    // Calculate price range
    const price = parseInt(product.price.replace(/[^\d]/g, ''));
    if (price < analysis.priceRange.min) analysis.priceRange.min = price;
    if (price > analysis.priceRange.max) analysis.priceRange.max = price;
    
    // Calculate average rating
    if (product.rating) {
      totalRating += product.rating;
      ratedProducts++;
    }
  });
  
  if (ratedProducts > 0) {
    analysis.avgRating = totalRating / ratedProducts;
  }
  
  return analysis;
};
