import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API base URL
  const API_BASE_URL = "http://localhost:8080/api/wishlist";

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch wishlist items from backend
  const fetchWishlistItems = async () => {
    if (!user) {
      setWishlistItems([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(API_BASE_URL, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setWishlistItems(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching wishlist items:", err);
      setError("Failed to load wishlist items");
      if (err.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("token");
        setWishlistItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load wishlist items when user changes
  useEffect(() => {
    if (user) {
      fetchWishlistItems();
    } else {
      // Clear wishlist when user logs out
      setWishlistItems([]);
      setError(null);
    }
  }, [user]);

  const addToWishlist = async (product) => {
    if (!user) {
      alert("Please sign in to add items to wishlist");
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(API_BASE_URL, {
        productName: product.name,
        productPrice: product.price,
        productImage: product.image,
        productCategory: product.category,
        productRating: product.rating
      }, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        await fetchWishlistItems(); // Refresh wishlist items
        return true;
      }
    } catch (err) {
      console.error("Error adding to wishlist:", err);
      if (err.response?.status === 400 && err.response?.data?.message === "Item already in wishlist") {
        setError("Item already in wishlist");
      } else {
        setError("Failed to add item to wishlist");
      }
      if (err.response?.status === 401) {
        alert("Please sign in to add items to wishlist");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productName) => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.delete(`${API_BASE_URL}/product/${encodeURIComponent(productName)}`, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        await fetchWishlistItems(); // Refresh wishlist items
        return true;
      }
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      setError("Failed to remove item from wishlist");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productName) => {
    return wishlistItems.some((item) => item.productName === productName);
  };

  const clearWishlist = async () => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.delete(API_BASE_URL, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setWishlistItems([]);
        return true;
      }
    } catch (err) {
      console.error("Error clearing wishlist:", err);
      setError("Failed to clear wishlist");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const moveToCart = async (product, addToCart) => {
    try {
      console.log("🔄 WishlistContext - moveToCart called with:", product);

      // Transform wishlist item to cart product format
      const cartProduct = {
        name: product.productName || product.name,
        price: product.productPrice || product.price,
        image: product.productImage || product.image,
        category: product.productCategory || product.category,
        rating: product.productRating || product.rating || 0
      };

      console.log("🔄 WishlistContext - Transformed product for cart:", cartProduct);

      // Add to cart
      const cartSuccess = await addToCart(cartProduct);
      if (cartSuccess) {
        // Remove from wishlist
        const removeSuccess = await removeFromWishlist(product.productName || product.name);
        return removeSuccess;
      }
      return false;
    } catch (error) {
      console.error("Error in moveToCart:", error);
      return false;
    }
  };

  const moveAllToCart = async () => {
    if (!user) return { success: false, message: "Please sign in to move items to cart" };

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_BASE_URL}/move-all-to-cart`, {}, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        // Refresh wishlist items
        await fetchWishlistItems();
        return {
          success: true,
          message: response.data.message,
          data: response.data.data
        };
      } else {
        return {
          success: false,
          message: response.data.message,
          data: response.data.data
        };
      }
    } catch (err) {
      console.error("Error moving all items to cart:", err);
      setError("Failed to move items to cart");
      return {
        success: false,
        message: "Failed to move items to cart"
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    moveToCart,
    moveAllToCart,
    fetchWishlistItems,
    loading,
    error,
    wishlistCount: wishlistItems.length,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
