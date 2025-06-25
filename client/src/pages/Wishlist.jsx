import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaShoppingCart, FaTrash, FaArrowLeft } from "react-icons/fa";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import ChatbotFloat from "../components/ChatbotFloat";
import { renderStars } from "../utils/starRating";

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist, clearWishlist, moveToCart, moveAllToCart } = useWishlist();
  const { addToCart } = useCart();
  const { showSuccess, showError } = useToast();

  const handleBuyNow = (product) => {
    navigate("/checkout", { state: { product } });
  };

  const handleMoveToCart = async (product) => {
    try {
      await moveToCart(product, addToCart);
      showSuccess(`${product.productName || product.name} moved to cart!`);
    } catch (error) {
      showError(`Failed to move ${product.productName || product.name} to cart`);
    }
  };

  const handleRemoveFromWishlist = (productName) => {
    removeFromWishlist(productName);
    showSuccess(`Product removed from wishlist!`);
  };

  const handleMoveAllToCart = async () => {
    if (wishlistItems.length === 0) {
      showError("No items in wishlist to move");
      return;
    }

    try {
      const result = await moveAllToCart();

      if (result.success) {
        showSuccess(result.message);
      } else {
        showError(result.message || "Failed to move items to cart. Please try again.");
      }
    } catch (error) {
      console.error("Error in move all to cart:", error);
      showError("Failed to move items to cart. Please try again.");
    }
  };



  return (
    <div className="min-h-screen bg-gray-100 w-full">
      <div className="w-full px-6 py-6">
        {/* Full Screen Header */}
        <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white py-12 px-8 mb-8 -mx-6 -mt-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => navigate(-1)}
                  className="mr-6 p-3 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition"
                >
                  <FaArrowLeft className="text-xl" />
                </button>
                <div>
                  <h1 className="text-5xl font-bold flex items-center mb-2">
                    <FaHeart className="text-white mr-4" />
                    My Wishlist
                  </h1>
                  <p className="text-xl text-white text-opacity-90">
                    {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
                  </p>
                </div>
              </div>

              {wishlistItems.length > 0 && (
                <button
                  onClick={clearWishlist}
                  className="flex items-center px-6 py-3 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition text-lg font-semibold"
                >
                  <FaTrash className="mr-2" />
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Empty Wishlist */}
        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <FaHeart className="text-gray-300 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">
              Save items you love by clicking the heart icon on any product
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          /* Wishlist Items */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((product, idx) => (
              <div
                key={product._id || idx}
                className="bg-white rounded-xl shadow p-4 flex flex-col relative hover:shadow-lg transition"
              >
                {/* Remove from wishlist button */}
                <button
                  onClick={() => handleRemoveFromWishlist(product.productName || product.name)}
                  className="absolute top-3 right-3 text-red-500 hover:text-red-700 transition z-10"
                >
                  <FaHeart className="text-lg" />
                </button>

                {/* Product Image */}
                <img
                  src={product.productImage || product.image}
                  alt={product.productName || product.name}
                  className="rounded-lg w-full h-44 object-cover mb-3"
                />

                {/* Product Details */}
                <div className="flex-1 flex flex-col">
                  <div className="font-semibold text-base mb-1">{product.productName || product.name}</div>
                  
                  {/* Rating */}
                  <div className="flex items-center text-sm mb-1">
                    {renderStars(product.productRating || product.rating || 4.5)}
                    <span className="text-gray-500 ml-2 text-xs">({product.reviews || '100+'})</span>
                  </div>

                  {/* Category */}
                  <div className="text-xs text-gray-500 mb-2">{product.productCategory || product.category}</div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-lg text-gray-800">
                      {product.productPrice || product.price}
                    </span>
                    <span className="text-xs text-gray-500">
                      {product.inStock !== false ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 mt-auto">
                    <button
                      onClick={() => handleBuyNow(product)}
                      className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Buy Now
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMoveToCart(product)}
                        className="flex-1 bg-green-600 text-white rounded-lg py-2 font-semibold hover:bg-green-700 transition-colors flex items-center justify-center text-sm"
                      >
                        <FaShoppingCart className="mr-1" />
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleRemoveFromWishlist(product.productName || product.name)}
                        className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
                        title="Remove from wishlist"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {wishlistItems.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleMoveAllToCart}
                className="flex items-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
              >
                <FaShoppingCart className="mr-2" />
                Move All to Cart
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
                    clearWishlist();
                    showSuccess('Wishlist cleared!');
                  }
                }}
                className="flex items-center px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
              >
                <FaTrash className="mr-2" />
                Clear Wishlist
              </button>
              <button
                onClick={() => navigate("/shop")}
                className="flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
      <ChatbotFloat />
    </div>
  );
};

export default Wishlist;
