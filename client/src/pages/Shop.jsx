import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaCheckCircle, FaSearch, FaInfoCircle } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useWishlistSidebar } from "../context/WishlistSidebarContext";
import { useCartSidebar } from "../context/CartSidebarContext";
import { useAuth } from "../context/AuthContext";
import ChatbotFloat from "../components/ChatbotFloat";
import SearchHighlight from "../components/SearchHighlight";
import { renderStars } from "../utils/starRating";
import { searchProducts, analyzeSearchResults } from "../utils/searchUtils";
import "../styles/Shop.css";

const categories = [
  "All Categories",
  "Fashion",
  "Electronics",
  "Smart Watches",
  "Shoes",
  "Home Decor",
  "Books",
  "Kitchen",
  "Sports",
];

// Map category names to match database categories
const categoryMapping = {
  "Fashion": "fashion",
  "Electronics": "electronics",
  "Smart Watches": "watches",
  "Shoes": "footwear",
  "Home Decor": "home-decor",
  "Books": "books",
  "Kitchen": "kitchen",
  "Sports": "sports"
};

const products = [
  // Fashion Products
  {
    name: "POLO T-shirt",
    price: "₹1999",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
    inStock: true,
    category: "Fashion",
    rating: 4.5,
    reviews: 45,
  },
  {
    name: "Girls kurti",
    price: "₹299",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
    inStock: true,
    category: "Fashion",
    rating: 4.3,
    reviews: 67,
  },
  {
    name: "Designer Jeans",
    price: "₹2499",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d",
    inStock: true,
    category: "Fashion",
    rating: 4.6,
    reviews: 89,
  },
  {
    name: "Casual Shirt",
    price: "₹1299",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c",
    inStock: true,
    category: "Fashion",
    rating: 4.2,
    reviews: 34,
  },
  {
    name: "Summer Dress",
    price: "₹1799",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446",
    inStock: true,
    category: "Fashion",
    rating: 4.7,
    reviews: 56,
  },
  {
    name: "Formal Blazer",
    price: "₹3999",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    inStock: true,
    category: "Fashion",
    rating: 4.4,
    reviews: 23,
  },
  {
    name: "Ethnic Wear Set",
    price: "₹2799",
    image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2",
    inStock: true,
    category: "Fashion",
    rating: 4.8,
    reviews: 78,
  },
  {
    name: "Denim Jacket",
    price: "₹2199",
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256",
    inStock: true,
    category: "Fashion",
    rating: 4.1,
    reviews: 42,
  },

  // Electronics Products
  {
    name: "Leader model-380",
    price: "₹6999",
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308",
    inStock: true,
    category: "Electronics",
    rating: 4.7,
    reviews: 89,
  },
  {
    name: "Zoom sn40",
    price: "₹1599",
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308",
    inStock: true,
    category: "Electronics",
    rating: 4.1,
    reviews: 34,
  },
  {
    name: "JBL Speaker",
    price: "₹4999",
    image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2",
    inStock: true,
    category: "Electronics",
    rating: 4.4,
    reviews: 92,
  },
  {
    name: "Gaming Laptop Pro",
    price: "₹89999",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
    inStock: true,
    category: "Electronics",
    rating: 4.8,
    reviews: 156,
  },
  {
    name: "4K Smart TV",
    price: "₹45999",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1",
    inStock: true,
    category: "Electronics",
    rating: 4.6,
    reviews: 234,
  },
  {
    name: "Wireless Headphones",
    price: "₹3299",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    inStock: true,
    category: "Electronics",
    rating: 4.5,
    reviews: 178,
  },
  {
    name: "Smartphone Pro Max",
    price: "₹79999",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
    inStock: true,
    category: "Electronics",
    rating: 4.9,
    reviews: 345,
  },
  {
    name: "Tablet Ultra",
    price: "₹25999",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0",
    inStock: true,
    category: "Electronics",
    rating: 4.3,
    reviews: 123,
  },

  // Smart Watches Products
  {
    name: "Sonata k89 watch",
    price: "₹1399",
    image: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b",
    inStock: true,
    category: "Smart Watches",
    rating: 4.2,
    reviews: 23,
  },
  {
    name: "Premium Watch",
    price: "₹4999",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    inStock: true,
    category: "Smart Watches",
    rating: 4.6,
    reviews: 78,
  },
  {
    name: "Luxury Gold Watch",
    price: "₹15999",
    image: "https://images.unsplash.com/photo-1594534475808-b18fc33b045e",
    inStock: true,
    category: "Smart Watches",
    rating: 4.8,
    reviews: 145,
  },
  {
    name: "Sports Fitness Tracker",
    price: "₹2999",
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256",
    inStock: true,
    category: "Smart Watches",
    rating: 4.4,
    reviews: 89,
  },
  {
    name: "Classic Analog Watch",
    price: "₹3499",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314",
    inStock: true,
    category: "Smart Watches",
    rating: 4.3,
    reviews: 67,
  },
  {
    name: "Digital Smart Watch",
    price: "₹7999",
    image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d",
    inStock: true,
    category: "Smart Watches",
    rating: 4.7,
    reviews: 198,
  },
  {
    name: "Vintage Style Watch",
    price: "₹2299",
    image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa",
    inStock: true,
    category: "Smart Watches",
    rating: 4.1,
    reviews: 45,
  },
  {
    name: "Professional Chronograph",
    price: "₹12999",
    image: "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf",
    inStock: true,
    category: "Smart Watches",
    rating: 4.9,
    reviews: 234,
  },

  // Shoes Products
  {
    name: "Ketch neo-X",
    price: "₹399",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
    inStock: true,
    category: "Shoes",
    rating: 3.8,
    reviews: 12,
  },
  {
    name: "Running Shoes Pro",
    price: "₹2999",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772",
    inStock: true,
    category: "Shoes",
    rating: 4.5,
    reviews: 156,
  },
  {
    name: "Casual Sneakers",
    price: "₹1899",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43",
    inStock: true,
    category: "Shoes",
    rating: 4.2,
    reviews: 89,
  },
  {
    name: "Formal Leather Shoes",
    price: "₹4599",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000",
    inStock: true,
    category: "Shoes",
    rating: 4.6,
    reviews: 134,
  },
  {
    name: "High-Top Basketball Shoes",
    price: "₹3799",
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3",
    inStock: true,
    category: "Shoes",
    rating: 4.4,
    reviews: 98,
  },
  {
    name: "Women's Heels",
    price: "₹2299",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2",
    inStock: true,
    category: "Shoes",
    rating: 4.1,
    reviews: 67,
  },
  {
    name: "Hiking Boots",
    price: "₹5999",
    image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f",
    inStock: true,
    category: "Shoes",
    rating: 4.7,
    reviews: 178,
  },
  {
    name: "Canvas Slip-On",
    price: "₹1299",
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77",
    inStock: true,
    category: "Shoes",
    rating: 4.0,
    reviews: 45,
  },

  // Home Decor Products
  {
    name: "Home Decor Set",
    price: "₹1299",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
    inStock: true,
    category: "Home Decor",
    rating: 4.2,
    reviews: 41,
  },
  {
    name: "Modern Wall Art",
    price: "₹2499",
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0",
    inStock: true,
    category: "Home Decor",
    rating: 4.5,
    reviews: 78,
  },
  {
    name: "Decorative Vase Collection",
    price: "₹1899",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96",
    inStock: true,
    category: "Home Decor",
    rating: 4.3,
    reviews: 56,
  },
  {
    name: "Luxury Throw Pillows",
    price: "₹999",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
    inStock: true,
    category: "Home Decor",
    rating: 4.1,
    reviews: 34,
  },
  {
    name: "Ambient Table Lamp",
    price: "₹3299",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    inStock: true,
    category: "Home Decor",
    rating: 4.6,
    reviews: 89,
  },
  {
    name: "Decorative Mirror Set",
    price: "₹4599",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
    inStock: true,
    category: "Home Decor",
    rating: 4.4,
    reviews: 67,
  },
  {
    name: "Indoor Plant Collection",
    price: "₹1599",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b",
    inStock: true,
    category: "Home Decor",
    rating: 4.7,
    reviews: 123,
  },
  {
    name: "Scented Candle Set",
    price: "₹799",
    image: "https://images.unsplash.com/photo-1602874801006-e26c4c5b5b8b",
    inStock: true,
    category: "Home Decor",
    rating: 4.0,
    reviews: 45,
  },

  // Books Products
  {
    name: "Harry potter module3",
    price: "₹799",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794",
    inStock: true,
    category: "Books",
    rating: 4.9,
    reviews: 156,
  },
  {
    name: "The Great Gatsby",
    price: "₹599",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f",
    inStock: true,
    category: "Books",
    rating: 4.7,
    reviews: 234,
  },
  {
    name: "Programming Fundamentals",
    price: "₹1299",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765",
    inStock: true,
    category: "Books",
    rating: 4.5,
    reviews: 89,
  },
  {
    name: "Mystery Novel Collection",
    price: "₹999",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570",
    inStock: true,
    category: "Books",
    rating: 4.3,
    reviews: 67,
  },
  {
    name: "Science Fiction Anthology",
    price: "₹1199",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    inStock: true,
    category: "Books",
    rating: 4.6,
    reviews: 123,
  },
  {
    name: "Cookbook Masterclass",
    price: "₹899",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
    inStock: true,
    category: "Books",
    rating: 4.4,
    reviews: 78,
  },
  {
    name: "Self-Help Guide",
    price: "₹699",
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73",
    inStock: true,
    category: "Books",
    rating: 4.2,
    reviews: 45,
  },
  {
    name: "History Chronicles",
    price: "₹1099",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
    inStock: true,
    category: "Books",
    rating: 4.8,
    reviews: 167,
  },

  // Kitchen Products
  {
    name: "Kitchen Essentials",
    price: "₹899",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136",
    inStock: true,
    category: "Kitchen",
    rating: 4.0,
    reviews: 28,
  },
  {
    name: "Premium Coffee Maker",
    price: "₹8999",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
    inStock: true,
    category: "Kitchen",
    rating: 4.5,
    reviews: 67,
  },
  {
    name: "Non-Stick Cookware Set",
    price: "₹3499",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136",
    inStock: true,
    category: "Kitchen",
    rating: 4.3,
    reviews: 89,
  },
  {
    name: "Electric Blender Pro",
    price: "₹2299",
    image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371",
    inStock: true,
    category: "Kitchen",
    rating: 4.4,
    reviews: 56,
  },
  {
    name: "Stainless Steel Knife Set",
    price: "₹1599",
    image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65",
    inStock: true,
    category: "Kitchen",
    rating: 4.6,
    reviews: 123,
  },
  {
    name: "Digital Kitchen Scale",
    price: "₹999",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136",
    inStock: true,
    category: "Kitchen",
    rating: 4.2,
    reviews: 34,
  },
  {
    name: "Microwave Oven",
    price: "₹12999",
    image: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078",
    inStock: true,
    category: "Kitchen",
    rating: 4.7,
    reviews: 178,
  },
  {
    name: "Food Storage Container Set",
    price: "₹799",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
    inStock: true,
    category: "Kitchen",
    rating: 4.1,
    reviews: 45,
  },

  // Sports Products
  {
    name: "Sports Gear",
    price: "₹2499",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
    inStock: true,
    category: "Sports",
    rating: 4.5,
    reviews: 63,
  },
  {
    name: "Professional Football",
    price: "₹1299",
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d",
    inStock: true,
    category: "Sports",
    rating: 4.3,
    reviews: 89,
  },
  {
    name: "Basketball Premium",
    price: "₹999",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc",
    inStock: true,
    category: "Sports",
    rating: 4.4,
    reviews: 67,
  },
  {
    name: "Tennis Racket Set",
    price: "₹3499",
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256",
    inStock: true,
    category: "Sports",
    rating: 4.6,
    reviews: 123,
  },
  {
    name: "Yoga Mat Premium",
    price: "₹1599",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b",
    inStock: true,
    category: "Sports",
    rating: 4.2,
    reviews: 45,
  },
  {
    name: "Gym Dumbbell Set",
    price: "₹4999",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
    inStock: true,
    category: "Sports",
    rating: 4.7,
    reviews: 156,
  },
  {
    name: "Cricket Bat Professional",
    price: "₹2799",
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e",
    inStock: true,
    category: "Sports",
    rating: 4.5,
    reviews: 98,
  },
  {
    name: "Swimming Goggles Pro",
    price: "₹799",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
    inStock: true,
    category: "Sports",
    rating: 4.1,
    reviews: 34,
  },
];

const Shop = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { openWishlistSidebar } = useWishlistSidebar();
  const { openCartSidebar } = useCartSidebar();

  // Filter and search state
  const [selectedCategories, setSelectedCategories] = useState(["All Categories"]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recommended");

  // Database products state
  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch database products
  const fetchDbProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setDbProducts(data.data.products || []);
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching database products:', error);
      setError('Failed to load some products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products on component mount
  useEffect(() => {
    fetchDbProducts();
  }, []);

  // Normalize database products to match hardcoded product format
  const normalizeDbProduct = (dbProduct) => {
    return {
      id: dbProduct._id,
      name: dbProduct.name,
      price: `₹${dbProduct.price.toLocaleString()}`,
      image: dbProduct.primaryImage || dbProduct.images?.[0]?.url || "https://via.placeholder.com/300",
      inStock: dbProduct.stock > 0,
      category: dbProduct.category.charAt(0).toUpperCase() + dbProduct.category.slice(1).replace('-', ' '),
      rating: dbProduct.rating || 0,
      reviews: dbProduct.reviewCount || 0,
      isDbProduct: true, // Flag to identify database products
      originalProduct: dbProduct // Keep reference to original data
    };
  };

  // Combine hardcoded and database products
  const allProducts = useMemo(() => {
    const normalizedDbProducts = dbProducts.map(normalizeDbProduct);
    return [...products, ...normalizedDbProducts];
  }, [dbProducts]);

  // Handle URL search parameters
  React.useEffect(() => {
    const updateFromURL = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const searchQuery = searchParams.get('search');
      const categoryQuery = searchParams.get('category');

      if (searchQuery) {
        setSearchTerm(searchQuery);
      } else {
        setSearchTerm('');
      }

      if (categoryQuery) {
        setSelectedCategories([categoryQuery]);
      }
    };

    // Initial update
    updateFromURL();

    // Listen for URL changes
    const handlePopState = () => {
      updateFromURL();
    };

    window.addEventListener('popstate', handlePopState);

    // Override pushState to catch programmatic navigation
    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      setTimeout(updateFromURL, 0);
    };

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.history.pushState = originalPushState;
    };
  }, []);

  const handleBuyNow = (product) => {
    navigate("/checkout", { state: { product } });
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      alert("Please sign in to add items to cart");
      return;
    }

    const success = await addToCart(product);
    if (success) {
      openCartSidebar();
      alert(`✅ ${product.name} added to cart!`);
    }
  };

  const handleWishlistToggle = async (product) => {
    console.log("❤️ handleWishlistToggle called with:", product);
    console.log("👤 Current user:", user);

    if (!user) {
      alert("Please sign in to manage your wishlist");
      return;
    }

    if (isInWishlist(product.name)) {
      console.log("🗑️ Removing from wishlist...");
      const success = await removeFromWishlist(product.name);
      console.log("🗑️ removeFromWishlist result:", success);
      if (success) {
        alert(`💔 ${product.name} removed from wishlist!`);
      }
    } else {
      console.log("➕ Adding to wishlist...");
      const success = await addToWishlist(product);
      console.log("➕ addToWishlist result:", success);
      if (success) {
        alert(`❤️ ${product.name} added to wishlist!`);
      } else {
        alert(`❌ Failed to add ${product.name} to wishlist`);
      }
    }
  };

  // Handle category filter
  const handleCategoryChange = (category) => {
    if (category === "All Categories") {
      setSelectedCategories(["All Categories"]);
    } else {
      setSelectedCategories(prev => {
        const filtered = prev.filter(cat => cat !== "All Categories");
        if (filtered.includes(category)) {
          const newCategories = filtered.filter(cat => cat !== category);
          return newCategories.length === 0 ? ["All Categories"] : newCategories;
        } else {
          return [...filtered, category];
        }
      });
    }
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = allProducts;

    // Filter by category
    if (!selectedCategories.includes("All Categories")) {
      filtered = filtered.filter(product =>
        selectedCategories.includes(product.category)
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        return filtered.sort((a, b) =>
          parseInt(a.price.replace(/[^\d]/g, "")) - parseInt(b.price.replace(/[^\d]/g, ""))
        );
      case "price-high":
        return filtered.sort((a, b) =>
          parseInt(b.price.replace(/[^\d]/g, "")) - parseInt(a.price.replace(/[^\d]/g, ""))
        );
      case "rating":
        return filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "name":
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return filtered;
    }
  }, [allProducts, selectedCategories, searchTerm, sortBy]);



  return (
    <div
      className="h-screen bg-gray-100 w-full p-0 overflow-hidden"
    >
      <div className="w-full h-full flex flex-col">
        <h1 className="text-4xl font-bold mb-2 px-8 pt-8">Shop Products</h1>
        <p className="text-gray-500 text-lg mb-6 px-8">
          Browse our collection of products and find exactly what you are looking for
        </p>

        

        <div className="flex gap-6 px-8 flex-1 overflow-hidden">
          {/* Filters */}
          <aside className="bg-white rounded-xl shadow p-6 w-64 h-full overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Filters</h2>
            <div>
              <h3 className="font-medium mb-2">Categories</h3>
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => handleCategoryChange(cat)}
                      className="accent-blue-600 mr-2"
                    />
                    <span className="cursor-pointer" onClick={() => handleCategoryChange(cat)}>
                      {cat}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Results count */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {filteredAndSortedProducts.length} of {allProducts.length} products
                {loading && <span className="ml-2 text-blue-600">Loading...</span>}
                {error && <span className="ml-2 text-red-600">{error}</span>}
              </p>
            </div>
          </aside>

          {/* Product List */}
          <main className="flex-1 overflow-y-auto">
            {/* Search and Sort */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-2xl pl-12 pr-6 py-3 shadow bg-white outline-none text-lg"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white rounded-xl px-6 py-3 pr-10 shadow font-medium text-lg outline-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 12px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '16px',
                  appearance: 'none'
                }}
              >
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredAndSortedProducts.map((product, idx) => (
                <div
                  key={product.id || idx}
                  className="bg-white rounded-xl shadow p-3 flex flex-col relative hover:shadow-lg transition"
                >
                  <button
                    onClick={() => handleWishlistToggle(product)}
                    className={`absolute top-4 right-4 transition ${
                      isInWishlist(product.name)
                        ? "text-red-500 hover:text-red-700"
                        : "text-gray-400 hover:text-red-500"
                    }`}
                  >
                    <FaHeart />
                  </button>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="rounded-lg w-full h-44 object-cover mb-3"
                  />
                  <div className="flex-1 flex flex-col">
                    <div className="font-semibold text-base mb-1">{product.name}</div>
                    <div className="flex items-center text-sm mb-1">
                      {renderStars(product.rating)}
                      <span className="text-gray-500 ml-2 text-xs">({product.reviews})</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">{product.category}</div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-base text-gray-800">
                        {product.price}
                      </span>
                      <span className="flex items-center text-xs text-gray-600">
                        <FaCheckCircle className="text-green-500 mr-1" />
                        In stock
                      </span>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => handleBuyNow(product)}
                        className="flex-1 bg-black text-white rounded-lg py-2 font-semibold hover:bg-gray-800 transition"
                      >
                        Buy Now
                      </button>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 bg-gray-200 text-black rounded-lg py-2 font-semibold hover:bg-gray-500 transition"
                      >
                        Add to cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No results message */}
            {filteredAndSortedProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                <button
                  onClick={() => {
                    setSelectedCategories(["All Categories"]);
                    setSearchTerm("");
                    setSortBy("recommended");
                  }}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
      <ChatbotFloat />
    </div>
  );
};

export default Shop;
