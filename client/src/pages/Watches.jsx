import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaCheckCircle, FaSearch, FaClock } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useCartSidebar } from "../context/CartSidebarContext";
import ChatbotFloat from "../components/ChatbotFloat";
import { renderStars } from "../utils/starRating";

// Watches products data
const watchesProducts = [
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
];

const Watches = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { openCartSidebar } = useCartSidebar();

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recommended");

  const handleBuyNow = (product) => {
    navigate("/checkout", { state: { product } });
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    openCartSidebar();
    alert(`✅ ${product.name} added to cart!`);
  };

  const handleWishlistToggle = (product) => {
    if (isInWishlist(product.name)) {
      removeFromWishlist(product.name);
      alert(`💔 ${product.name} removed from wishlist!`);
    } else {
      addToWishlist(product);
      alert(`❤️ ${product.name} added to wishlist!`);
    }
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = watchesProducts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [searchTerm, sortBy]);

  // Render star rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => <FaStar key={i} className="text-yellow-500" />)}
        {hasHalfStar && <FaStar className="text-yellow-300" />}
        {[...Array(emptyStars)].map((_, i) => <FaRegStar key={i} className="text-gray-300" />)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 w-full p-0">
      <div className="w-full">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-gray-800 to-black text-white py-16 px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <FaClock className="text-4xl mr-3" />
              <h1 className="text-5xl font-bold">Watches</h1>
            </div>
            <p className="text-xl mb-6">
              Timeless elegance meets modern technology in our watch collection
            </p>
            <div className="text-lg">
              <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                {watchesProducts.length} Premium Timepieces Available
              </span>
            </div>
          </div>
        </div>

        <div className="px-8 py-8">
          {/* Search and Sort */}
          <div className="flex items-center gap-4 mb-8 max-w-6xl mx-auto">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search watches..."
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
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredAndSortedProducts.map((product, idx) => (
                <div
                  key={idx}
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
                        className="flex-1 bg-gray-800 text-white rounded-lg py-2 font-semibold hover:bg-black transition"
                      >
                        Buy Now
                      </button>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 bg-gray-200 text-black rounded-lg py-2 font-semibold hover:bg-gray-300 transition"
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
                <p className="text-gray-500 text-lg">No watches found matching your search.</p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSortBy("recommended");
                  }}
                  className="mt-4 bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-black transition"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <ChatbotFloat />
    </div>
  );
};

export default Watches;
