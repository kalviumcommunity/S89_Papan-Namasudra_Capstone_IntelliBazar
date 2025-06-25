import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaShoppingCart, FaTrash, FaTimes, FaArrowRight, FaMinus, FaPlus } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useCartSidebar } from "../context/CartSidebarContext";

const CartSidebar = () => {
  const { isOpen, closeCartSidebar } = useCartSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    cartItems,
    removeFromCart,
    incrementQty,
    decrementQty,
    clearCart
  } = useCart();

  // Close sidebar when navigating to cart page
  useEffect(() => {
    if (location.pathname === '/cart' && isOpen) {
      closeCartSidebar();
    }
  }, [location.pathname, isOpen, closeCartSidebar]);

  // Don't render sidebar on cart page
  if (location.pathname === '/cart') {
    return null;
  }

  const getItemPrice = (priceStr) => Number(priceStr.replace(/[^\d]/g, ""));

  const total = cartItems.reduce(
    (sum, item) => sum + getItemPrice(item.productPrice || item.price) * item.quantity,
    0
  );

  const handleCheckout = () => {
    navigate("/checkout");
    closeCartSidebar();
  };

  const handleRemoveFromCart = async (itemId) => {
    const success = await removeFromCart(itemId);
    if (success) {
      alert("❌ Item removed from cart!");
    }
  };

  const handleClearCart = async () => {
    const success = await clearCart();
    if (success) {
      alert("🗑️ Cart cleared!");
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen && location.pathname !== '/cart' ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaShoppingCart className="text-white mr-2" />
              <h2 className="text-xl font-bold">Shopping Cart</h2>
            </div>
            <button
              onClick={closeCartSidebar}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
          <p className="text-sm text-white text-opacity-90 mt-1">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in cart
          </p>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {cartItems.length === 0 ? (
              /* Empty State */
              <div className="text-center py-12">
                <FaShoppingCart className="text-gray-300 text-4xl mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Your cart is empty</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Add some products to get started
                </p>
                <button
                  onClick={() => {
                    navigate("/shop");
                    closeCartSidebar();
                  }}
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-red-900 transition font-semibold"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              /* Cart Items List */
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item._id || item.name}
                    className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={item.productImage || item.image}
                        alt={item.productName || item.name}
                        className="w-16 h-16 rounded object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm leading-tight mb-1">
                          {item.productName || item.name}
                        </h4>
                        <p className="text-black font-semibold text-sm mb-2">
                          {item.productPrice || item.price}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => decrementQty(item._id || item.name)}
                              className="p-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                            >
                              <FaMinus className="text-xs" />
                            </button>
                            <span className="px-2 py-1 bg-white border rounded text-sm font-semibold min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => incrementQty(item._id || item.name)}
                              className="p-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                            >
                              <FaPlus className="text-xs" />
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemoveFromCart(item._id || item.name)}
                            className="text-red-500 hover:text-red-700 transition p-1"
                            title="Remove from cart"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Clear All Button - Below cart items */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleClearCart}
                    className="w-full flex items-center justify-center px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
                  >
                    <FaTrash className="mr-2" />
                    Clear All Items
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions - Fixed at bottom */}
          {cartItems.length > 0 && (
            <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4 space-y-3">
              {/* Total */}
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-black">₹{total}</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-black text-white py-3 rounded-lg hover:bg-red-900 transition font-semibold flex items-center justify-center"
                >
                  Proceed to Checkout
                  <FaArrowRight className="ml-2" />
                </button>


              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
