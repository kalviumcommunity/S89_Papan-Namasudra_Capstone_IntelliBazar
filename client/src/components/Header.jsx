import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaMicrophone,
  FaHeart,
  FaShoppingCart,
  FaUserCircle,
  FaSearch,
  FaMicrophoneSlash,
  FaCog,
  FaChevronDown,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useWishlistSidebar } from '../context/WishlistSidebarContext';
import { useCartSidebar } from '../context/CartSidebarContext';
import useVoiceSearch from '../hooks/useVoiceSearch';
import SearchSuggestions from './SearchSuggestions';
import '../styles/VoiceSearch.css';

const Header = () => {
  const { user } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { openWishlistSidebar } = useWishlistSidebar();
  const { openCartSidebar } = useCartSidebar();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Voice search hook
  const {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceSearch();

  // Handle voice search transcript updates
  useEffect(() => {
    if (transcript && !isListening) {
      // Set the transcript as search term and trigger search
      setSearchTerm(transcript);
      // Auto-trigger search after voice input is complete
      if (transcript.trim()) {
        navigate(`/shop?search=${encodeURIComponent(transcript.trim())}`);
        resetTranscript(); // Clear transcript after search
      }
    }
  }, [transcript, isListening, navigate, resetTranscript]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDropdown && !event.target.closest('.user-dropdown')) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  // Clear error messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        resetTranscript(); // This also clears the error
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, resetTranscript]);

  // Handle search functionality
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Save to search history
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const newHistory = [searchTerm.trim(), ...history.filter(item => item !== searchTerm.trim())].slice(0, 5);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));

      // Navigate to shop page with search query
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      // Don't clear search term to maintain it in the header
      setShowSuggestions(false); // Hide suggestions
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      setIsSearchFocused(false);
    }
  };

  // Handle search input focus
  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    setShowSuggestions(true);
  };

  // Handle search input blur
  const handleSearchBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setIsSearchFocused(false);
      setShowSuggestions(false);
    }, 200);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    // Auto-search when suggestion is selected
    navigate(`/shop?search=${encodeURIComponent(suggestion)}`);
    // Save to search history
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const newHistory = [suggestion, ...history.filter(item => item !== suggestion)].slice(0, 5);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  // Handle search input change
  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  // Handle voice search button click
  const handleVoiceSearch = () => {
    if (!isSupported) {
      alert('Voice search is not supported in this browser. Please try using Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <header className="flex items-center justify-between px-8 py-4 shadow bg-white sticky top-0 z-50 w-full">
      {/* Left: Logo */}
      <div className="flex items-center">
        <Link to="/" className="text-3xl font-bold flex items-center">
          <img
            src="https://png.pngtree.com/png-clipart/20241120/original/pngtree-creative-design-shopping-cart-icon-png-image_17269496.png"
            alt="IntelliBazar Logo"
            className="w-10 h-10 mr-2"
          />
          IntelliBazar
        </Link>
      </div>

      {/* Center: Nav */}
      <nav className="flex space-x-8 mx-12">
        <Link to="/" className="font-medium">Home</Link>
        <Link to="/shop" className="font-medium">Shop</Link>
        <Link to="/collections" className="font-medium">Collections</Link>
        <Link to="/about" className="font-medium">About</Link>
        <Link to="/Chat" className="font-medium">Chat</Link>
        <Link to="/Shorts" className="font-medium">Shorts</Link>
      </nav>

      {/* Right: Search and Icons */}
      <div className="flex items-center space-x-5">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleVoiceSearch}
            disabled={!isSupported}
            title={
              !isSupported
                ? "Voice search not supported in this browser"
                : isListening
                  ? "Stop listening"
                  : "Start voice search"
            }
            className={`voice-button p-2 rounded-full transition-all duration-200 ${
              !isSupported
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : isListening
                  ? "bg-red-500 text-white voice-listening voice-glow shadow-lg"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700 hover:shadow-md"
            } ${error ? "voice-error" : ""}`}
            aria-label={
              !isSupported
                ? "Voice search not supported"
                : isListening
                  ? "Stop voice search"
                  : "Start voice search"
            }
          >
            {isListening ? <FaMicrophoneSlash className="voice-glow" /> : <FaMicrophone />}
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder={isListening ? "🎤 Listening..." : "Search products..."}
              value={searchTerm}
              onChange={handleSearchInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className={`rounded-full px-4 py-2 pr-10 shadow focus:outline-none focus:ring-2 focus:ring-blue-500 w-72 ml-2 transition-all duration-200 ${
                isListening ? "voice-input-listening border-2 border-red-300 bg-red-50" : ""
              } ${isSearchFocused ? "ring-2 ring-blue-500" : ""}`}
              aria-label="Search products"
              autoComplete="off"
            />
            <button
              onClick={handleSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition"
              aria-label="Search"
            >
              <FaSearch />
            </button>

            {/* Search Suggestions */}
            <SearchSuggestions
              searchTerm={searchTerm}
              onSuggestionClick={handleSuggestionClick}
              isVisible={showSuggestions}
              onClose={() => setShowSuggestions(false)}
            />

            {/* Voice search status indicator */}
            {isListening && (
              <div className="voice-status absolute -bottom-8 left-2 text-xs text-red-600 font-medium bg-white px-2 py-1 rounded shadow-sm border">
                🎤 Listening... Speak now
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="voice-status voice-error absolute -bottom-8 left-2 text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded shadow-sm border border-red-200">
                ⚠️ {error}
              </div>
            )}

            {/* Success message when transcript is received */}
            {transcript && !isListening && (
              <div className="voice-status voice-success absolute -bottom-8 left-2 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded shadow-sm border border-green-200">
                ✓ Voice search: "{transcript}"
              </div>
            )}
          </div>
        </div>
        <button
          onClick={openWishlistSidebar}
          title="Wishlist"
          className="relative"
        >
          <FaHeart className="text-black text-xl cursor-pointer" />
          {wishlistCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
        </button>
        <button
          onClick={openCartSidebar}
          title="Cart"
          className="relative"
        >
          <FaShoppingCart className="text-black text-xl cursor-pointer" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
        {user ? (
          <div className="relative user-dropdown">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-1 text-black hover:text-gray-600 transition"
              title="User Menu"
            >
              <FaUserCircle className="text-xl" />
              <FaChevronDown className="text-xs" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                <div className="py-1">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                    onClick={() => setShowUserDropdown(false)}
                  >
                    <FaUserCircle className="inline mr-2" />
                    Profile
                  </Link>

                  {(user.role === 'admin' || user.role === 'seller') && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <FaCog className="inline mr-2" />
                      {user.role === 'admin' ? 'Admin Dashboard' : 'Seller Dashboard'}
                    </Link>
                  )}

                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                    onClick={() => setShowUserDropdown(false)}
                  >
                    <FaShoppingCart className="inline mr-2" />
                    My Orders
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="font-medium hover:text-blue-600">
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;