import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaCheckCircle, FaSearch } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useWishlistSidebar } from "../context/WishlistSidebarContext";
import { useCartSidebar } from "../context/CartSidebarContext";
import { useToast } from "../context/ToastContext";
import ChatbotFloat from "../components/ChatbotFloat";
import { renderStars } from "../utils/starRating";

// Fashion products data
const fashionProducts = [
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
];

const Fashion = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { openWishlistSidebar } = useWishlistSidebar();
  const { openCartSidebar } = useCartSidebar();
  const { showSuccess } = useToast();

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recommended");

  const handleBuyNow = (product) => {
    navigate("/checkout", { state: { product } });
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    openCartSidebar();
    showSuccess(`${product.name} added to cart!`);
  };

  const handleWishlistToggle = (product) => {
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
    let filtered = fashionProducts;

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
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white  relative overflow-hidden py-6 px-8">
          <div className="max-w-4xl text-sm mx-auto text-center">
            <h1 className="text-4xl font-bold">Fashion Collection</h1>
            <p className="text-sl mb-2">
              Discover the latest trends and timeless classics in our curated fashion collection
            </p>
            <div className="text-sm">
              <span className=" bg-opacity-20 px-4 py-2 rounded-full">
                {fashionProducts.length} Items
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
                        className="flex-1 bg-purple-600 text-white rounded-lg py-2 font-semibold hover:bg-purple-700 transition"
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
                <p className="text-gray-500 text-lg">No fashion items found matching your search.</p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSortBy("recommended");
                  }}
                  className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
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

export default Fashion;
