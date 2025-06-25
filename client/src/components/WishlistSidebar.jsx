import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHeart, FaShoppingCart, FaTrash, FaTimes } from "react-icons/fa";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useWishlistSidebar } from "../context/WishlistSidebarContext";
import { renderStars } from "../utils/starRating";

const WishlistSidebar = () => {
  const { isOpen, closeWishlistSidebar } = useWishlistSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const { wishlistItems, removeFromWishlist, clearWishlist, moveToCart, moveAllToCart } = useWishlist();
  const { addToCart, fetchCartItems } = useCart();

  // Close sidebar when navigating to wishlist page
  useEffect(() => {
    if (location.pathname === '/wishlist' && isOpen) {
      closeWishlistSidebar();
    }
  }, [location.pathname, isOpen, closeWishlistSidebar]);

  // Don't render sidebar on wishlist page
  if (location.pathname === '/wishlist') {
    return null;
  }

  const handleBuyNow = (product) => {
    navigate("/checkout", { state: { product } });
    closeWishlistSidebar();
  };

  const handleMoveToCart = async (product) => {
    try {
      const success = await moveToCart(product, addToCart);
      if (success) {
        // Refresh cart items to show the moved item
        await fetchCartItems();
        alert(`✅ ${product.productName || product.name} moved to cart!`);
      } else {
        alert(`❌ Failed to move ${product.productName || product.name} to cart`);
      }
    } catch (error) {
      console.error("Error moving item to cart:", error);
      alert(`❌ Failed to move ${product.productName || product.name} to cart`);
    }
  };

  const handleRemoveFromWishlist = async (productName) => {
    const success = await removeFromWishlist(productName);
    if (success) {
      alert(`❌ Product removed from wishlist!`);
    }
  };

  const handleMoveAllToCart = async () => {
    if (wishlistItems.length === 0) {
      alert("No items in wishlist to move");
      return;
    }

    try {
      const result = await moveAllToCart();

      if (result.success) {
        // Refresh cart items to show the moved items
        await fetchCartItems();
        alert(`✅ ${result.message}`);
      } else {
        alert(`❌ ${result.message || "Failed to move items to cart. Please try again."}`);
      }
    } catch (error) {
      console.error("Error in move all to cart:", error);
      alert("❌ Failed to move items to cart. Please try again.");
    }
  };





  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen && location.pathname !== '/wishlist' ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaHeart className="text-white mr-2" />
              <h2 className="text-xl font-bold">My Wishlist</h2>
            </div>
            <button
              onClick={closeWishlistSidebar}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
          <p className="text-sm text-white text-opacity-90 mt-1">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          {/* Wishlist Items */}
          <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {wishlistItems.length === 0 ? (
              /* Empty State */
              <div className="text-center py-12">
                <FaHeart className="text-gray-300 text-4xl mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Your wishlist is empty</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Save items you love by clicking the heart icon
                </p>
                <button
                  onClick={() => {
                    navigate("/shop");
                    closeWishlistSidebar();
                  }}
                  className="bg-black text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-900 transition text-sm"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              /* Wishlist Items */
              <div className="space-y-4">
                {wishlistItems.map((product, idx) => (
                  <div
                    key={product._id || idx}
                    className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition"
                  >
                    <div className="flex space-x-3">
                      {/* Product Image */}
                      <img
                        src={product.productImage || product.image}
                        alt={product.productName || product.name}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-800 truncate">
                          {product.productName || product.name}
                        </h4>

                        {/* Rating */}
                        <div className="flex items-center mt-1">
                          {renderStars(product.productRating || product.rating, '', 'xs')}
                          <span className="text-gray-500 ml-1 text-xs">({product.reviews || 0})</span>
                        </div>

                        {/* Category & Price */}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">{product.productCategory || product.category}</span>
                          <span className="font-semibold text-sm text-gray-800">{product.productPrice || product.price}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => handleBuyNow(product)}
                            className="flex-1 bg-black text-white rounded py-1 text-xs font-semibold hover:bg-red-900 transition"
                          >
                            Buy Now
                          </button>
                          <button
                            onClick={() => handleMoveToCart(product)}
                            className="flex-1 bg-gray-200 text-gray-800 rounded py-1 text-xs font-semibold hover:bg-gray-300 transition"
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={() => handleRemoveFromWishlist(product.productName || product.name)}
                            className="p-1 text-red-500 hover:text-red-700 transition"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions - Fixed at bottom */}
          {wishlistItems.length > 0 && (
            <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4">
              {/* Quick Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={handleMoveAllToCart}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-black text-white rounded-lg hover:bg-red-900 transition text-sm font-semibold"
                >
                  <FaShoppingCart className="mr-2" />
                  Move All to Cart
                </button>
                <button
                  onClick={clearWishlist}
                  className="flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-semibold"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WishlistSidebar;
