// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API base URL
  const API_BASE_URL = "http://localhost:8080/api/cart";

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    };
  };

  // Fetch cart items from backend
  const fetchCartItems = async () => {
    if (!user) {
      console.log("👤 No user, clearing cart items");
      setCartItems([]);
      return;
    }

    console.log("🔄 Fetching cart items for user:", user);

    try {
      setLoading(true);
      setError(null);

      const headers = getAuthHeaders();
      console.log("🔑 Fetch headers:", headers);

      const response = await axios.get(API_BASE_URL, {
        headers
      });

      console.log("📦 Fetch cart response:", response.data);

      if (response.data.success) {
        console.log("✅ Setting cart items:", response.data.data);
        setCartItems(response.data.data);
      } else {
        console.log("❌ Fetch cart failed:", response.data);
      }
    } catch (err) {
      console.error("❌ Error fetching cart items:", err);
      console.error("❌ Error response:", err.response?.data);
      setError("Failed to load cart items");
      if (err.response?.status === 401) {
        // Token expired or invalid
        console.log("🔐 Token expired, clearing cart");
        localStorage.removeItem("token");
        setCartItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load cart items when user changes
  useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
      // Clear cart when user logs out
      setCartItems([]);
      setError(null);
    }
  }, [user]);

  const addToCart = async (product) => {
    console.log("🛒 AddToCart called with product:", product);
    console.log("👤 Current user:", user);

    if (!user) {
      console.log("❌ No user found, cannot add to cart");
      alert("Please sign in to add items to cart");
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      // Validate product data before sending
      if (!product.name || !product.price || !product.image || !product.category) {
        console.error("❌ Invalid product data - missing required fields:", product);
        alert("Invalid product data. Please try again.");
        return false;
      }

      const cartData = {
        productName: product.name,
        productPrice: product.price,
        productImage: product.image,
        productCategory: product.category,
        productRating: product.rating || 0,
        quantity: 1
      };

      console.log("📦 Sending cart data:", cartData);
      console.log("🔍 Product object received:", product);
      console.log("🔍 Individual fields:");
      console.log("  - productName:", product.name, typeof product.name);
      console.log("  - productPrice:", product.price, typeof product.price);
      console.log("  - productImage:", product.image, typeof product.image);
      console.log("  - productCategory:", product.category, typeof product.category);
      console.log("  - productRating:", product.rating, typeof product.rating);

      const authHeaders = getAuthHeaders();
      console.log("🔑 Auth headers:", authHeaders);
      console.log("🔑 Token exists:", !!localStorage.getItem("token"));
      console.log("🔑 User exists:", !!user);

      const response = await axios.post(API_BASE_URL, cartData, {
        headers: getAuthHeaders()
      });

      console.log("📥 Add to cart response:", response.data);

      if (response.data.success) {
        // Update cart items immediately with the new item
        const newItem = response.data.data;
        console.log("✅ New cart item:", newItem);

        // Check if item already exists (for quantity update)
        const existingItemIndex = cartItems.findIndex(item =>
          item.productName === newItem.productName
        );

        if (existingItemIndex >= 0) {
          // Update existing item quantity
          const updatedItems = [...cartItems];
          updatedItems[existingItemIndex] = newItem;
          setCartItems(updatedItems);
          console.log("🔄 Updated existing item quantity");
        } else {
          // Add new item to cart
          setCartItems(prevItems => [...prevItems, newItem]);
          console.log("➕ Added new item to cart");
        }

        // Also fetch to ensure consistency
        console.log("🔄 Fetching cart items to ensure consistency...");
        await fetchCartItems();
        console.log("✅ Cart items refreshed successfully");
        return true;
      } else {
        console.log("❌ Add to cart failed:", response.data);
        return false;
      }
    } catch (err) {
      console.error("❌ Error adding to cart:", err);
      console.error("❌ Error response:", err.response?.data);
      console.error("❌ Error status:", err.response?.status);
      console.error("❌ Error message:", err.message);
      setError("Failed to add item to cart");
      if (err.response?.status === 401) {
        alert("Please sign in to add items to cart");
      } else if (err.response?.status === 400) {
        console.error("❌ 400 Bad Request - Validation failed");
        console.error("❌ Request data was:", {
          productName: product.name,
          productPrice: product.price,
          productImage: product.image,
          productCategory: product.category,
          productRating: product.rating,
          quantity: 1
        });
        alert(`Failed to add item to cart: ${err.response?.data?.message || 'Invalid data'}`);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.delete(`${API_BASE_URL}/${itemId}`, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        await fetchCartItems(); // Refresh cart items
        return true;
      }
    } catch (err) {
      console.error("Error removing from cart:", err);
      setError("Failed to remove item from cart");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const incrementQty = async (itemId) => {
    if (!user) return false;

    const item = cartItems.find(item => item._id === itemId);
    if (!item) return false;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.put(`${API_BASE_URL}/${itemId}`, {
        quantity: item.quantity + 1
      }, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        await fetchCartItems(); // Refresh cart items
        return true;
      }
    } catch (err) {
      console.error("Error updating cart quantity:", err);
      setError("Failed to update quantity");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const decrementQty = async (itemId) => {
    if (!user) return false;

    const item = cartItems.find(item => item._id === itemId);
    if (!item || item.quantity <= 1) return false;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.put(`${API_BASE_URL}/${itemId}`, {
        quantity: item.quantity - 1
      }, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        await fetchCartItems(); // Refresh cart items
        return true;
      }
    } catch (err) {
      console.error("Error updating cart quantity:", err);
      setError("Failed to update quantity");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.delete(API_BASE_URL, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setCartItems([]);
        return true;
      }
    } catch (err) {
      console.error("Error clearing cart:", err);
      setError("Failed to clear cart");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        incrementQty,
        decrementQty,
        clearCart,
        fetchCartItems,
        loading,
        error,
        cartCount: cartItems.length
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
