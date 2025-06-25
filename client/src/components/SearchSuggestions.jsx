import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaClock, FaTimes } from 'react-icons/fa';

const SearchSuggestions = ({ 
  searchTerm, 
  onSuggestionClick, 
  onClearHistory,
  isVisible,
  onClose 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const suggestionRef = useRef(null);

  // Sample product data for suggestions (in real app, this would come from API)
  const sampleProducts = [
    'Laptop', 'Smartphone', 'Headphones', 'Keyboard', 'Mouse',
    'T-shirt', 'Jeans', 'Sneakers', 'Watch', 'Sunglasses',
    'Book', 'Notebook', 'Pen', 'Backpack', 'Wallet',
    'Coffee Mug', 'Water Bottle', 'Charger', 'Cable', 'Speaker',
    'Camera', 'Tablet', 'Monitor', 'Desk', 'Chair',
    'Shoes', 'Dress', 'Jacket', 'Hat', 'Bag'
  ];

  const categories = [
    'Electronics', 'Fashion', 'Books', 'Home Decor', 
    'Sports', 'Kitchen', 'Smart Watches', 'Shoes'
  ];

  // Load search history from localStorage
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setSearchHistory(history.slice(0, 5)); // Keep only last 5 searches
  }, []);

  // Generate suggestions based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const productSuggestions = sampleProducts
      .filter(product => product.toLowerCase().includes(term))
      .slice(0, 5)
      .map(product => ({ type: 'product', text: product }));

    const categorySuggestions = categories
      .filter(category => category.toLowerCase().includes(term))
      .slice(0, 3)
      .map(category => ({ type: 'category', text: category }));

    setSuggestions([...productSuggestions, ...categorySuggestions]);
  }, [searchTerm]);

  // Save search to history
  const saveToHistory = (searchText) => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const newHistory = [searchText, ...history.filter(item => item !== searchText)].slice(0, 5);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    setSearchHistory(newHistory);
  };

  // Clear search history
  const clearHistory = () => {
    localStorage.removeItem('searchHistory');
    setSearchHistory([]);
    if (onClearHistory) onClearHistory();
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    saveToHistory(suggestion.text);
    if (onSuggestionClick) {
      onSuggestionClick(suggestion.text);
    }
  };

  // Handle history item click
  const handleHistoryClick = (historyItem) => {
    if (onSuggestionClick) {
      onSuggestionClick(historyItem);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        if (onClose) onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div 
      ref={suggestionRef}
      className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-80 overflow-y-auto"
    >
      {/* Search History */}
      {!searchTerm.trim() && searchHistory.length > 0 && (
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Recent Searches
            </span>
            <button
              onClick={clearHistory}
              className="text-xs text-gray-400 hover:text-red-500 transition"
            >
              <FaTimes className="w-3 h-3" />
            </button>
          </div>
          {searchHistory.map((item, index) => (
            <button
              key={index}
              onClick={() => handleHistoryClick(item)}
              className="flex items-center w-full text-left px-2 py-1 hover:bg-gray-50 rounded text-sm text-gray-700 transition"
            >
              <FaClock className="w-3 h-3 mr-2 text-gray-400" />
              {item}
            </button>
          ))}
        </div>
      )}

      {/* Search Suggestions */}
      {searchTerm.trim() && suggestions.length > 0 && (
        <div className="p-3">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
            Suggestions
          </span>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="flex items-center w-full text-left px-2 py-2 hover:bg-gray-50 rounded text-sm transition"
            >
              <FaSearch className="w-3 h-3 mr-3 text-gray-400" />
              <span className="text-gray-700">{suggestion.text}</span>
              <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                suggestion.type === 'category' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {suggestion.type === 'category' ? 'Category' : 'Product'}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* No suggestions */}
      {searchTerm.trim() && suggestions.length === 0 && (
        <div className="p-4 text-center text-gray-500 text-sm">
          No suggestions found for "{searchTerm}"
        </div>
      )}

      {/* Popular searches when no input */}
      {!searchTerm.trim() && searchHistory.length === 0 && (
        <div className="p-3">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
            Popular Searches
          </span>
          {['Laptop', 'Smartphone', 'Headphones', 'T-shirt', 'Sneakers'].map((item, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick({ type: 'product', text: item })}
              className="flex items-center w-full text-left px-2 py-1 hover:bg-gray-50 rounded text-sm text-gray-700 transition"
            >
              <FaSearch className="w-3 h-3 mr-2 text-gray-400" />
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;
