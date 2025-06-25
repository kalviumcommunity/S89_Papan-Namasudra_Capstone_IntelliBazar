import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaStar,
  FaHeart,
  FaArrowRight,
  FaPlus,
} from "react-icons/fa";
import "../styles/Home.css"; // Make sure this file has styles for .banner-image, .arrow, .dot, etc.
import ChatbotFloat from "../components/ChatbotFloat";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useWishlistSidebar } from "../context/WishlistSidebarContext";
import { useCartSidebar } from "../context/CartSidebarContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const banners = [
  {
    image:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    alt: "IntelliBazar - Smart Shopping Experience",
  },
  {
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    alt: "Latest Electronics & Gadgets",
  },
  {
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    alt: "Premium Fashion Collection",
  },
  {
    image:
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2126&q=80",
    alt: "Home Decor & Lifestyle",
  },
  {
    image:
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    alt: "Exclusive Deals & Offers",
  },
  {
    image:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    alt: "Sports & Fitness Gear",
  },
];

const featuredProducts = [
  {
    name: "Sonata k89 watch",
    price: "₹1399",
    image: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b",
    category: "Watches",
    rating: 4,
  },
  {
    name: "POLO T-shirt",
    price: "₹1999",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
    category: "Fashion",
    rating: 5,
  },
  {
    name: "Ketch neo-X",
    price: "₹399",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
    category: "Footwear",
    rating: 3,
  },
  {
    name: "Leader model-380",
    price: "₹6999",
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308",
    category: "Electronics",
    rating: 4,
  },
  {
    name: "Wireless Headphones",
    price: "₹2499",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    category: "Electronics",
    rating: 5,
  },
  {
    name: "Smart Fitness Band",
    price: "₹3299",
    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6",
    category: "Electronics",
    rating: 4,
  },
  {
    name: "Designer Sunglasses",
    price: "₹899",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f",
    category: "Fashion",
    rating: 4,
  },
  {
    name: "Premium Backpack",
    price: "₹1799",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
    category: "Fashion",
    rating: 5,
  },
];

const categories = [
  { name: "Fashion", icon: "👗" },
  { name: "Electronics", icon: "💻" },
  { name: "Smart Watches", icon: "⌚" },
  { name: "Shoes", icon: "👟" },
  { name: "Home Decor", icon: "🛋️" },
  { name: "Books", icon: "📚" },
  { name: "Kitchen", icon: "🍳" },
  { name: "Sports", icon: "🏏" },
];

const Home = () => {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { openWishlistSidebar } = useWishlistSidebar();
  const { openCartSidebar } = useCartSidebar();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const goPrev = () =>
    setIndex((prev) => (prev - 1 + banners.length) % banners.length);
  const goNext = () => setIndex((prev) => (prev + 1) % banners.length);

  // Handle Buy Now - Navigate directly to checkout
  const handleBuyNow = (product) => {
    navigate("/checkout", { state: { product } });
  };

  // Handle Add to Cart - Just add to cart
  const handleAddToCart = async (product) => {
    if (!user) {
      const shouldRedirect = window.confirm(
        "Please sign in to add items to cart. Would you like to go to the login page?"
      );
      if (shouldRedirect) {
        navigate('/login');
      }
      return;
    }

    const success = await addToCart(product);

    if (success) {
      openCartSidebar();
      showSuccess(`${product.name} added to cart!`);
    } else {
      showSuccess(`❌ Failed to add ${product.name} to cart`);
    }
  };

  const handleWishlistToggle = async (product) => {
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
      const success = await removeFromWishlist(product.name);
      if (success) {
        showSuccess(`${product.name} removed from wishlist!`);
      }
    } else {
      const success = await addToWishlist(product);
      if (success) {
        openWishlistSidebar();
        showSuccess(`${product.name} added to wishlist!`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 w-full">
      {/* ✅ Banner Section */}
      <div className="hero-banner relative">
        <img
          src={banners[index].image}
          alt={banners[index].alt}
          className="banner-image w-full h-[550px] object-cover"
        />
        <button className="arrow left" onClick={goPrev}>
          &#10094;
        </button>
        <button className="arrow right" onClick={goNext}>
          &#10095;
        </button>
        <div className="dots absolute bottom-4 justify-center flex gap-2">
          {banners.map((_, i) => (
            <span
              key={i}
              className={`dot ${i === index ? "active" : ""}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="absolute bottom-8 right-8 flex gap-4 z-10">
          <Link
            to="/collections"
            className="inline-flex items-center px-4 py-3 bg-white bg-opacity-90 text-black border border-gray-300 rounded-lg font-semibold text-sm hover:bg-opacity-100 hover:shadow-lg transition-all duration-300 backdrop-blur-sm"
          >
             View Collections
          </Link>
        </div>
      </div>

      {/* ✅ Categories */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-6">
          {categories.map((cat) => (
            <Link
              to={`/shop?category=${encodeURIComponent(cat.name)}`}
              key={cat.name}
              className="flex flex-col items-center bg-white rounded-xl shadow p-4 hover:bg-blue-50 transition"
            >
              <span className="text-4xl mb-2">{cat.icon}</span>
              <span className="font-medium text-gray-700">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ✅ Featured Products */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Featured Products</h2>
          <Link
            to="/shop"
            className="text-blue-600 font-semibold hover:underline flex items-center"
          >
            View all <FaArrowRight className="ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {featuredProducts.map((product, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow p-4 flex flex-col relative hover:shadow-lg transition"
            >
              <button
                onClick={() => handleWishlistToggle(product)}
                className={`absolute top-5 right-5 transition ${
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
                className="rounded-lg w-full h-48 object-cover mb-3"
              />
              <div className="font-semibold text-lg mb-1">{product.name}</div>
              <div className="flex items-center text-yellow-500 text-base mb-1">
                {[...Array(product.rating)].map((_, i) => (
                  <FaStar key={i} />
                ))}
                {[...Array(5 - product.rating)].map((_, i) => (
                  <FaStar key={i} className="text-gray-300" />
                ))}
              </div>
              <div className="font-bold text-gray-800 mb-3">{product.price}</div>
              <div className="mt-auto flex gap-2">
                <button
                  onClick={() => handleBuyNow(product)}
                  className="flex-1 bg-black text-white rounded-lg py-2 font-semibold hover:bg-gray-800 transition flex items-center justify-center"
                >
                  <FaShoppingCart className="mr-1 text-sm" />
                  Buy Now
                </button>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 bg-gray-200 text-black rounded-lg py-2 font-semibold hover:bg-gray-500 transition flex items-center justify-center"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ✅ App Features Showcase */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-black py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Experience Smart Shopping
            </h2>
            <p className="text-gray-300 text-lg">
              Discover all the powerful features that make IntelliBazar your perfect shopping companion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Chat Assistant */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <span className="text-white text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">AI Shopping Assistant</h3>
              <p className="text-gray-600 mb-6">
                Get personalized product recommendations and instant answers to your shopping questions with our intelligent chatbot.
              </p>
              <Link
                to="/chat"
                className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors"
              >
                Try AI Chat <FaArrowRight className="ml-2" />
              </Link>
            </div>

            {/* Smart Search */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-r from-green-500 to-teal-600 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <span className="text-white text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Smart Search</h3>
              <p className="text-gray-600 mb-6">
                Find exactly what you're looking for with our advanced search that understands natural language and visual cues.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center text-green-600 font-semibold hover:text-green-800 transition-colors"
              >
                Explore Products <FaArrowRight className="ml-2" />
              </Link>
            </div>

            {/* Wishlist & Cart */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-r from-red-500 to-pink-600 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <FaHeart className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Wishlist & Cart</h3>
              <p className="text-gray-600 mb-6">
                Save your favorite items and manage your shopping cart with our intuitive sidebar interface.
              </p>
              <button className="inline-flex items-center text-red-600 font-semibold hover:text-red-800 transition-colors">
                View Wishlist <FaArrowRight className="ml-2" />
              </button>
            </div>

            {/* Product Categories */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-r from-orange-500 to-yellow-600 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <span className="text-white text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Diverse Categories</h3>
              <p className="text-gray-600 mb-6">
                Browse through electronics, fashion, home decor, books, sports gear, and much more in organized categories.
              </p>
              <Link
                to="/collections"
                className="inline-flex items-center text-orange-600 font-semibold hover:text-orange-800 transition-colors"
              >
                Browse Categories <FaArrowRight className="ml-2" />
              </Link>
            </div>

            {/* User Profile */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-r from-indigo-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <span className="text-white text-2xl">👤</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Personal Profile</h3>
              <p className="text-gray-600 mb-6">
                Manage your account, track orders, view purchase history, and customize your shopping preferences.
              </p>
              <Link
                to="/profile"
                className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
              >
                My Profile <FaArrowRight className="ml-2" />
              </Link>
            </div>

            {/* Secure Checkout */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <span className="text-white text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Secure Checkout</h3>
              <p className="text-gray-600 mb-6">
                Complete your purchases with confidence using our secure payment system with multiple payment options.
              </p>
              <button className="inline-flex items-center text-purple-600 font-semibold hover:text-purple-800 transition-colors">
                Learn More <FaArrowRight className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Newsletter */}
      <section className="bg-white py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-2 text-gray-800">Stay Updated!</h3>
          <p className="text-gray-600 mb-6">
            Subscribe to our newsletter for exclusive offers and the latest updates.
          </p>
          <form className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="rounded-lg border border-gray-300 px-4 py-2 w-full sm:w-auto"
              required
            />
            <button
              type="submit"
              className="bg-black text-white rounded-lg px-6 py-2 font-semibold hover:bg-gray-800 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* ✅ Enhanced Footer */}
      <footer className="bg-gray-900 text-gray-200 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center">
                <img
                  src="https://png.pngtree.com/png-clipart/20241120/original/pngtree-creative-design-shopping-cart-icon-png-image_17269496.png"
                  alt="IntelliBazar Logo"
                  className="w-8 h-8 mr-3"
                />
                <span className="font-bold text-xl text-white">IntelliBazar</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your AI-powered shopping destination. Discover amazing products with personalized recommendations, smart search, and exceptional customer service.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-white text-lg">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/shop" className="text-gray-400 hover:text-white transition-colors">Shop All</Link></li>
                <li><Link to="/collections" className="text-gray-400 hover:text-white transition-colors">Collections</Link></li>
                <li><Link to="/cart" className="text-gray-400 hover:text-white transition-colors">Shopping Cart</Link></li>
                <li><Link to="/wishlist" className="text-gray-400 hover:text-white transition-colors">Wishlist</Link></li>
                <li><Link to="/profile" className="text-gray-400 hover:text-white transition-colors">My Account</Link></li>
                <li><Link to="/chat" className="text-gray-400 hover:text-white transition-colors">AI Assistant</Link></li>
              </ul>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <h3 className="font-semibold text-white text-lg">Categories</h3>
              <ul className="space-y-2">
                <li><Link to="/shop?category=Fashion" className="text-gray-400 hover:text-white transition-colors">Fashion</Link></li>
                <li><Link to="/shop?category=Electronics" className="text-gray-400 hover:text-white transition-colors">Electronics</Link></li>
                <li><Link to="/shop?category=Smart Watches" className="text-gray-400 hover:text-white transition-colors">Smart Watches</Link></li>
                <li><Link to="/shop?category=Home Decor" className="text-gray-400 hover:text-white transition-colors">Home Decor</Link></li>
                <li><Link to="/shop?category=Books" className="text-gray-400 hover:text-white transition-colors">Books</Link></li>
                <li><Link to="/shop?category=Sports" className="text-gray-400 hover:text-white transition-colors">Sports</Link></li>
              </ul>
            </div>

            {/* Customer Service */}
            <div className="space-y-4">
              <h3 className="font-semibold text-white text-lg">Customer Service</h3>
              <ul className="space-y-2">
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Shipping Info</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Returns & Exchanges</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Size Guide</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              </ul>
              <div className="pt-2">
                <p className="text-gray-400 text-sm">Need help?</p>
                <p className="text-white font-semibold">📞 1-800-INTELLI</p>
                <p className="text-gray-400 text-sm">Mon-Fri 9AM-6PM IST</p>
              </div>
            </div>
          </div>

          
          {/* Bottom Footer */}
          <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-gray-400 text-sm">
                © {new Date().getFullYear()} IntelliBazar. All rights reserved.
              </span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Accessibility</a>
            </div>
          </div>

          {/* Payment Methods & Security */}
          <div className="border-t border-gray-700 pt-6 mt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-gray-400 text-sm mb-2">Secure Payment Methods</p>
                <div className="flex space-x-3">
                  <div className="bg-white rounded px-2 py-1">
                    <span className="text-blue-600 font-bold text-xs">VISA</span>
                  </div>
                  <div className="bg-white rounded px-2 py-1">
                    <span className="text-red-600 font-bold text-xs">MC</span>
                  </div>
                  <div className="bg-white rounded px-2 py-1">
                    <span className="text-blue-800 font-bold text-xs">AMEX</span>
                  </div>
                  <div className="bg-white rounded px-2 py-1">
                    <span className="text-purple-600 font-bold text-xs">UPI</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">🔒 SSL Secured | 🛡️ 256-bit Encryption</p>
                <p className="text-gray-500 text-xs mt-1">Your data is safe with us</p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ✅ Floating Chatbot */}
      <ChatbotFloat />
    </div>
  );
};

export default Home;
