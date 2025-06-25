import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar, FaRegStar, FaHeart, FaCheckCircle, FaSearch, FaFire } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useWishlistSidebar } from "../context/WishlistSidebarContext";
import { useCartSidebar } from "../context/CartSidebarContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import ChatbotFloat from "../components/ChatbotFloat";

// New arrivals products data
const newArrivalsProducts = [
  {
    name: "Smart Fitness Watch Pro",
    price: "₹5999",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    inStock: true,
    category: "Smart Watches",
    rating: 4.8,
    reviews: 124,
    isNew: true,
  },
  {
    name: "Wireless Earbuds Elite",
    price: "₹3499",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df",
    inStock: true,
    category: "Electronics",
    rating: 4.6,
    reviews: 89,
    isNew: true,
  },
  {
    name: "Designer Sneakers",
    price: "₹4299",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772",
    inStock: true,
    category: "Shoes",
    rating: 4.7,
    reviews: 156,
    isNew: true,
  },
  {
    name: "Premium Coffee Maker",
    price: "₹8999",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
    inStock: true,
    category: "Kitchen",
    rating: 4.5,
    reviews: 67,
    isNew: true,
  },
  {
    name: "Trendy Backpack",
    price: "₹1899",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
    inStock: true,
    category: "Fashion",
    rating: 4.4,
    reviews: 98,
    isNew: true,
  },
  {
    name: "Gaming Mechanical Keyboard",
    price: "₹6499",
    image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a",
    inStock: true,
    category: "Electronics",
    rating: 4.9,
    reviews: 203,
    isNew: true,
  },
  {
    name: "Yoga Mat Premium",
    price: "₹2299",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b",
    inStock: true,
    category: "Sports",
    rating: 4.3,
    reviews: 45,
    isNew: true,
  },
  {
    name: "Smart Home Speaker",
    price: "₹7999",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    inStock: true,
    category: "Electronics",
    rating: 4.6,
    reviews: 134,
    isNew: true,
  },
];

const NewArrivals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { openWishlistSidebar } = useWishlistSidebar();
  const { openCartSidebar } = useCartSidebar();
  const { showSuccess, showError } = useToast();

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recommended");

  const handleBuyNow = (product) => {
    navigate("/checkout", { state: { product } });
  };

  const handleAddToCart = (product) => {
    if (!user) {
      const shouldRedirect = window.confirm(
        "Please sign in to add items to cart. Would you like to go to the login page?"
      );
      if (shouldRedirect) {
        navigate('/login');
      }
      return;
    }
    addToCart(product);
    openCartSidebar();
    showSuccess(`${product.name} added to cart!`);
  };

  const handleWishlistToggle = (product) => {
    if (!user) {
      const shouldRedirect = window.confirm(
        "Please sign in to manage wishlist. Would you like to go to the login page?"
      );
      if (shouldRedirect) {
        navigate('/login');
      }
      return;
    }
    if (isInWishlist(product.name)) {
      removeFromWishlist(product.name);
      showSuccess(`${product.name} removed from wishlist!`);
    } else {
      addToWishlist(product);
      openWishlistSidebar();
      showSuccess(`${product.name} added to wishlist!`);
    }
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = newArrivalsProducts;

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
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-5 px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center">
              <FaFire className="text-4xl mr-3" />
              <h1 className="text-4xl font-bold">New Arrivals</h1>
            </div>
            <p className="text-sm mb-3">
              Be the first to discover our latest products and cutting-edge innovations
            </p>
            <div className="text-sm">
              <span className=" bg-opacity-20 px-4 py-2 rounded-full">
                {newArrivalsProducts.length} Fresh Products Just Added
              </span>
            </div>
          </div>
        </div>

        <div className="px-8 py-8">
          

          {/* Product Grid */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredAndSortedProducts.map((product, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow p-3 flex flex-col relative hover:shadow-lg transition"
                >
                  {/* New Badge */}
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold z-10">
                    NEW
                  </div>
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
                        className="flex-1 bg-blue-600 text-white rounded-lg py-2 font-semibold hover:bg-blue-700 transition"
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
                <p className="text-gray-500 text-lg">No new arrivals found matching your search.</p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSortBy("recommended");
                  }}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
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

export default NewArrivals;
