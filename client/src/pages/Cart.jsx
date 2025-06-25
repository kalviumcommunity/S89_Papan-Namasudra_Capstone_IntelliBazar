// src/pages/Cart.jsx
import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    incrementQty,
    decrementQty,
    clearCart,
    loading,
    error
  } = useCart();
  const { showSuccess } = useToast();

  // Debug logging
  console.log("🛒 Cart page - cartItems:", cartItems);
  console.log("🛒 Cart page - loading:", loading);
  console.log("🛒 Cart page - error:", error);

  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const getItemPrice = (priceStr) => Number(priceStr.replace(/[^\d]/g, ""));

  const total = cartItems.reduce(
    (sum, item) => sum + getItemPrice(item.productPrice || item.price) * item.quantity,
    0
  );

  const handleCheckout = () => {
    // In real app, you'd integrate Stripe, Razorpay, etc.
    setCheckoutSuccess(true);
    clearCart(); // Optional: clear after checkout
    showSuccess('Checkout successful! Thank you for your purchase.');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Your Shopping Cart</h1>

        {checkoutSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow">
            ✅ Checkout successful! Thank you for your purchase.
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-lg text-center">
            <div className="text-gray-400 text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started!</p>
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
        <>
          <div className="space-y-4 mb-6">
            {cartItems.map((item) => (
              <div
                key={item._id || item.productName || item.name}
                className="bg-white p-6 shadow-lg rounded-lg flex items-center gap-6 hover:shadow-xl transition-shadow"
              >
                <img
                  src={item.productImage || item.image}
                  alt={item.productName || item.name}
                  className="w-28 h-28 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">{item.productName || item.name}</h2>
                  <p className="text-lg font-medium text-blue-600 mb-3">{item.productPrice || item.price}</p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">Quantity:</span>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => decrementQty(item._id)}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors rounded-l-lg"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 bg-gray-50 border-x border-gray-300 font-semibold min-w-[3rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => incrementQty(item._id)}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors rounded-r-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                <div className="flex flex-col items-end gap-2">
                  <p className="text-lg font-semibold text-gray-800">
                    ₹{getItemPrice(item.productPrice || item.price) * item.quantity}
                  </p>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Cart Total</h2>
                <p className="text-lg text-gray-600">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                <p className="text-4xl font-bold text-blue-600">₹{total}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={clearCart}
                className="w-full bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-md hover:shadow-lg"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </>
        )}
      </div>
    </div>
  );
};

export default Cart;
