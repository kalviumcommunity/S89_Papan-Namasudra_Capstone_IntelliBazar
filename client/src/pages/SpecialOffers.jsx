import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar, FaRegStar, FaHeart, FaCheckCircle, FaSearch, FaTag, FaPercent } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useWishlistSidebar } from "../context/WishlistSidebarContext";
import { useCartSidebar } from "../context/CartSidebarContext";
import { useAuth } from "../context/AuthContext";
import ChatbotFloat from "../components/ChatbotFloat";

// Special offers products data
const specialOffersProducts = [
  {
    name: "Premium Headphones",
    originalPrice: "₹4999",
    price: "₹2999",
    discount: "40%",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    inStock: true,
    category: "Electronics",
    rating: 4.5,
    reviews: 234,
    isOffer: true,
  },
  {
    name: "Designer Watch Collection",
    originalPrice: "₹8999",
    price: "₹5999",
    discount: "33%",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    inStock: true,
    category: "Smart Watches",
    rating: 4.7,
    reviews: 189,
    isOffer: true,
  },
  {
    name: "Luxury Handbag",
    originalPrice: "₹3999",
    price: "₹1999",
    discount: "50%",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
    inStock: true,
    category: "Fashion",
    rating: 4.6,
    reviews: 145,
    isOffer: true,
  },
  {
    name: "Smart Home Bundle",
    originalPrice: "₹12999",
    price: "₹8999",
    discount: "31%",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
    inStock: true,
    category: "Electronics",
    rating: 4.8,
    reviews: 98,
    isOffer: true,
  },
  {
    name: "Running Shoes Pro",
    originalPrice: "₹5999",
    price: "₹3599",
    discount: "40%",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772",
    inStock: true,
    category: "Shoes",
    rating: 4.4,
    reviews: 267,
    isOffer: true,
  },
  {
    name: "Kitchen Appliance Set",
    originalPrice: "₹15999",
    price: "₹9999",
    discount: "38%",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136",
    inStock: true,
    category: "Kitchen",
    rating: 4.3,
    reviews: 76,
    isOffer: true,
  },
  {
    name: "Home Decor Bundle",
    originalPrice: "₹2999",
    price: "₹1799",
    discount: "40%",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
    inStock: true,
    category: "Home Decor",
    rating: 4.2,
    reviews: 123,
    isOffer: true,
  },
  {
    name: "Fitness Equipment Set",
    originalPrice: "₹7999",
    price: "₹4999",
    discount: "38%",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
    inStock: true,
    category: "Sports",
    rating: 4.6,
    reviews: 156,
    isOffer: true,
  },
];

const SpecialOffers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { openWishlistSidebar } = useWishlistSidebar();
  const { openCartSidebar } = useCartSidebar();

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
    alert(`✅ ${product.name} added to cart!`);
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
      alert(`💔 ${product.name} removed from wishlist!`);
    } else {
      addToWishlist(product);
      openWishlistSidebar();
      alert(`❤️ ${product.name} added to wishlist!`);
    }
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = specialOffersProducts;

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
      case "discount":
        return filtered.sort((a, b) => 
          parseInt(b.discount.replace('%', '')) - parseInt(a.discount.replace('%', ''))
        );
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
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-5 px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center">
              <FaTag className="text-sm mr-3" />
              <h1 className="text-4xl font-bold">Special Offers</h1>
            </div>
            <p className="text-sm">
              Limited-time deals and exclusive discounts on premium products
            </p>
            <div className="text-lg">
              <span className=" bg-opacity-20 px-4 py-2 rounded-full">
                Save up to 50% on {specialOffersProducts.length} Products
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
                  {/* Discount Badge */}
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold z-10 flex items-center">
                    <FaPercent className="mr-1" />
                    {product.discount} OFF
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
                      <div className="flex flex-col">
                        <span className="font-semibold text-base text-gray-800">
                          {product.price}
                        </span>
                        <span className="text-xs text-gray-500 line-through">
                          {product.originalPrice}
                        </span>
                      </div>
                      <span className="flex items-center text-xs text-gray-600">
                        <FaCheckCircle className="text-green-500 mr-1" />
                        In stock
                      </span>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => handleBuyNow(product)}
                        className="flex-1 bg-red-600 text-white rounded-lg py-2 font-semibold hover:bg-red-700 transition"
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
                <p className="text-gray-500 text-lg">No special offers found matching your search.</p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSortBy("recommended");
                  }}
                  className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
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

export default SpecialOffers;
