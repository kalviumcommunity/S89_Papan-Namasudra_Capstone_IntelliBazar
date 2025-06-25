import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaCheckCircle, FaSearch, FaBolt } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useCartSidebar } from "../context/CartSidebarContext";
import ChatbotFloat from "../components/ChatbotFloat";
import { renderStars } from "../utils/starRating";

// Electronics products data
const electronicsProducts = [
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
];

const Electronics = () => {
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
    let filtered = electronicsProducts;

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



  return (
    <div className="min-h-screen bg-gray-100 w-full p-0">
      <div className="w-full">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white py-16 px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <FaBolt className="text-4xl mr-3" />
              <h1 className="text-5xl font-bold">Electronics</h1>
            </div>
            <p className="text-xl mb-6">
              Discover cutting-edge technology and innovative electronic devices
            </p>
            <div className="text-lg">
              <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                {electronicsProducts.length} Electronic Products Available
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
                        className="flex-1 bg-blue-800 text-white rounded-lg py-2 font-semibold hover:bg-blue-900 transition"
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
                <p className="text-gray-500 text-lg">No electronics found matching your search.</p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSortBy("recommended");
                  }}
                  className="mt-4 bg-blue-800 text-white px-6 py-2 rounded-lg hover:bg-blue-900 transition"
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

export default Electronics;
