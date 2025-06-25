import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaStar, FaRegStar, FaCheckCircle, FaCreditCard, FaMapMarkerAlt, FaUser, FaPhone, FaEnvelope, FaTag, FaTimes, FaSpinner, FaMoneyBillWave } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import ChatbotFloat from "../components/ChatbotFloat";
import AddressSelector from "../components/AddressSelector";
import OrderSuccessAnimation from "../components/OrderSuccessAnimation";
import axios from "axios";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, clearCart, fetchCartItems } = useCart();
  const { user } = useAuth();
  const { showSuccess, showError, showOrderConfirmation } = useToast();

  // Get product from navigation state (for Buy Now) or use cart items
  const product = location.state?.product;
  const isDirectPurchase = !!product;

  // Determine checkout items
  const checkoutItems = isDirectPurchase ? [{ ...product, quantity: 1 }] : cartItems;

  const [currentStep, setCurrentStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  // Audio ref for confirmation sound
  const audioRef = useRef(null);

  // Form states
  const [customerInfo, setCustomerInfo] = useState({
    firstName: user?.username?.split(' ')[0] || "",
    lastName: user?.username?.split(' ')[1] || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    address: user?.address || "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);



  // API base URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

  // Debug: Log environment variables (remove in production)
  console.log("🔧 Environment variables:", {
    API_BASE_URL,
    RAZORPAY_KEY: import.meta.env.VITE_RAZORPAY_KEY_ID ? "✅ Set" : "❌ Not set"
  });

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Handle address selection
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    if (address) {
      setShippingAddress({
        address: address.address,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: address.country
      });
      // Also update customer info if needed
      setCustomerInfo(prev => ({
        ...prev,
        firstName: address.firstName,
        lastName: address.lastName,
        phone: address.phone
      }));
    }
  };

  // Calculate pricing
  const getItemPrice = (priceStr) => {
    if (typeof priceStr === 'number') return priceStr;
    return Number(priceStr.replace(/[^\d]/g, ""));
  };

  const calculatePricing = () => {
    const subtotal = checkoutItems.reduce((sum, item) => {
      const price = getItemPrice(item.productPrice || item.price);
      return sum + (price * item.quantity);
    }, 0);

    const shipping = subtotal > 1000 ? 0 : 99;
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const discount = appliedCoupon ? appliedCoupon.discount : 0;
    const total = subtotal + shipping + tax - discount;

    return { subtotal, shipping, tax, discount, total };
  };

  const pricing = calculatePricing();

  // Load available coupons on component mount
  useEffect(() => {
    if (user) {
      fetchAvailableCoupons();
    }
  }, [user]);

  // Fetch available coupons
  const fetchAvailableCoupons = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders/coupons/available`, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setAvailableCoupons(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };

  // Apply coupon
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      showError("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/orders/validate-coupon`, {
        couponCode: couponCode.trim(),
        orderAmount: pricing.subtotal
      }, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setAppliedCoupon(response.data.data);
        showSuccess(`Coupon applied! You saved ₹${response.data.data.discount}`);
      }
    } catch (error) {
      showError(error.response?.data?.message || "Invalid coupon code");
    } finally {
      setCouponLoading(false);
    }
  };

  // Remove applied coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    showSuccess("Coupon removed");
  };

  // Render star rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => <FaStar key={i} className="text-yellow-500" />)}
        {hasHalfStar && <FaStar className="text-yellow-300" />}
        {[...Array(emptyStars)].map((_, i) => <FaRegStar key={i} className="text-gray-300" />)}
      </div>
    );
  };

  // Validation functions
  const validateStep = (step) => {
    switch (step) {
      case 1:
        return customerInfo.firstName && customerInfo.lastName && customerInfo.email && customerInfo.phone;
      case 2:
        return selectedAddress && shippingAddress.address && shippingAddress.city && shippingAddress.state && shippingAddress.pincode;
      case 3:
        if (paymentMethod === "card") {
          return cardDetails.cardholderName && cardDetails.cardNumber && cardDetails.expiryDate && cardDetails.cvv;
        }

        return true;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (!validateStep(currentStep)) {
      showError("Please fill in all required fields");
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Create order
  const createOrder = async () => {
    try {
      setLoading(true);

      const orderData = {
        customerInfo,
        shippingAddress,
        products: checkoutItems.map(item => ({
          productName: item.productName || item.name,
          productPrice: item.productPrice || item.price,
          productImage: item.productImage || item.image,
          productCategory: item.productCategory || item.category,
          productRating: item.productRating || item.rating || 0,
          quantity: item.quantity
        })),
        pricing: {
          subtotal: pricing.subtotal,
          shipping: pricing.shipping,
          tax: pricing.tax,
          discount: pricing.discount,
          couponCode: appliedCoupon?.couponCode,
          totalAmount: pricing.total
        },
        paymentMethod,
        couponCode: appliedCoupon?.couponCode,
        isDirectPurchase
      };

      const response = await axios.post(`${API_BASE_URL}/orders/create`, orderData, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setCreatedOrder(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      console.error("Error creating order:", error);
      showError(error.response?.data?.message || "Error creating order");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Load PayPal SDK dynamically
  const loadPayPalSDK = () => {
    return new Promise((resolve, reject) => {
      if (window.paypal) {
        resolve(window.paypal);
        return;
      }

      const script = document.createElement('script');
      const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'AYu97XgZ5vUagf5o8op2j7IOdgz3aLLfEO3Xu0KRZ0xl5M9KMlegnXOmLLW3H-UNsJvCibjYdMm953Xv';
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
      script.onload = () => resolve(window.paypal);
      script.onerror = () => reject(new Error('PayPal SDK failed to load'));
      document.head.appendChild(script);
    });
  };

  // Handle PayPal payment
  const handlePayPalPayment = async (orderData) => {
    try {
      setProcessingPayment(true);
      showSuccess("Loading PayPal...");

      // Load PayPal SDK
      const paypal = await loadPayPalSDK();

      return new Promise((resolve, reject) => {
        // Create a modal overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10000;
        `;

        // Create PayPal container
        const paypalContainer = document.createElement('div');
        paypalContainer.style.cssText = `
          background: white;
          padding: 20px;
          border-radius: 8px;
          max-width: 400px;
          width: 90%;
        `;
        paypalContainer.innerHTML = `
          <h3 style="margin: 0 0 20px 0; text-align: center;">Complete Payment</h3>
          <div id="paypal-button-container"></div>
          <button id="cancel-payment" style="margin-top: 10px; width: 100%; padding: 10px; background: #ccc; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
        `;

        overlay.appendChild(paypalContainer);
        document.body.appendChild(overlay);

        // Cancel button handler
        document.getElementById('cancel-payment').onclick = () => {
          document.body.removeChild(overlay);
          setProcessingPayment(false);
          reject(new Error("Payment cancelled"));
        };

        paypal.Buttons({
          createOrder: function(data, actions) {
            return actions.order.create(orderData.paypalOrderData);
          },
          onApprove: async function(data, actions) {
            try {
              const details = await actions.order.capture();

              const verifyResponse = await axios.post(`${API_BASE_URL}/orders/verify-payment`, {
                orderId: orderData.orderId,
                paypalOrderId: data.orderID,
                paypalPaymentId: details.id,
                payerInfo: details.payer
              }, {
                headers: getAuthHeaders()
              });

              if (verifyResponse.data.success) {
                // Clear cart if it was a cart checkout
                if (!isDirectPurchase) {
                  await clearCart();
                }
                document.body.removeChild(overlay);
                resolve(verifyResponse.data.data);
              } else {
                throw new Error("Payment verification failed");
              }
            } catch (error) {
              document.body.removeChild(overlay);
              reject(error);
            }
          },
          onError: function(err) {
            console.error('PayPal error:', err);
            document.body.removeChild(overlay);
            reject(new Error("PayPal payment failed"));
          },
          onCancel: function(data) {
            document.body.removeChild(overlay);
            reject(new Error("Payment cancelled"));
          }
        }).render('#paypal-button-container');
      });
    } catch (error) {
      setProcessingPayment(false);
      throw error;
    } finally {
      setProcessingPayment(false);
    }
  };

  // Play confirmation sound
  const playConfirmationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Create a pleasant confirmation melody
      const notes = [
        { freq: 523.25, duration: 0.2 }, // C5
        { freq: 659.25, duration: 0.2 }, // E5
        { freq: 783.99, duration: 0.4 }  // G5
      ];

      let startTime = audioContext.currentTime;

      notes.forEach((note) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Set frequency
        oscillator.frequency.setValueAtTime(note.freq, startTime);

        // Create envelope (attack, decay, sustain, release)
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.05); // Attack
        gainNode.gain.exponentialRampToValueAtTime(0.05, startTime + note.duration - 0.05); // Decay
        gainNode.gain.linearRampToValueAtTime(0, startTime + note.duration); // Release

        // Start and stop the oscillator
        oscillator.start(startTime);
        oscillator.stop(startTime + note.duration);

        startTime += note.duration;
      });
    } catch (error) {
      console.log("Audio not supported or failed:", error);
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateStep(3)) {
      showError("Please fill in all required fields");
      return;
    }

    try {
      // Step 1: Show payment loading (1-2 seconds)
      setPaymentLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPaymentLoading(false);

      // Step 2: Create order
      setLoading(true);
      const orderData = await createOrder();

      if (paymentMethod === "paypal") {
        // Handle PayPal payment
        await handlePayPalPayment(orderData);
      } else if (paymentMethod === "cod") {
        // Handle COD
        const completeResponse = await axios.post(`${API_BASE_URL}/orders/complete`, {
          orderId: orderData.orderId,
          clearCart: !isDirectPurchase
        }, {
          headers: getAuthHeaders()
        });

        if (completeResponse.data.success) {
          // Clear cart if it was a cart checkout
          if (!isDirectPurchase) {
            await clearCart();
          }
        }
      }

      // Step 3: Show success animation
      setLoading(false);
      setShowSuccessAnimation(true);

      // Play confirmation sound
      playConfirmationSound();

      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 4: Show final order confirmation
      setShowSuccessAnimation(false);
      setOrderPlaced(true);

      // Show enhanced order confirmation notification
      const orderNumber = orderData?.orderNumber || `#IB${Date.now().toString().slice(-6)}`;
      showOrderConfirmation(orderNumber, pricing.total);

    } catch (error) {
      console.error("Error placing order:", error);
      showError(error.message || "Error placing order");
      setPaymentLoading(false);
      setLoading(false);
      setShowSuccessAnimation(false);
    }
  };

  const handleBackToShopping = () => {
    navigate("/shop");
  };

  // Payment loading screen
  if (paymentLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-8">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="relative">
            <FaSpinner className="text-gray-600 text-6xl mx-auto mb-4 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Processing Payment Method...</h1>
          <p className="text-gray-600">Please wait while we prepare your {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod.toUpperCase()} payment.</p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
        <ChatbotFloat />
      </div>
    );
  }

  // Processing payment screen
  if (processingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-8">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <FaSpinner className="text-blue-600 text-6xl mx-auto mb-4 animate-spin" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Processing Payment...</h1>
          <p className="text-gray-600">Please wait while we process your payment.</p>
        </div>
        <ChatbotFloat />
      </div>
    );
  }

  // Success animation screen
  if (showSuccessAnimation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-8">
        <OrderSuccessAnimation
          orderData={createdOrder}
          totalAmount={pricing.total}
        />
        <ChatbotFloat />
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-8">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full text-center">
          <div className="mb-6">
            <div className="relative">
              <FaCheckCircle className="text-green-500 text-7xl mx-auto mb-4" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 border-4 border-green-200 rounded-full animate-ping"></div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600 mb-2">Thank you for your purchase with IntelliBazar.</p>
            <p className="text-sm text-green-600 font-medium">✓ Order confirmation email sent</p>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Order Number</p>
                <p className="font-bold text-gray-800">{createdOrder?.orderNumber || `#IB${Date.now().toString().slice(-6)}`}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Total Amount</p>
                <p className="font-bold text-lg text-green-600">₹{pricing.total}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Payment Method</p>
                <p className="font-semibold text-gray-800 capitalize">
                  {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Status</p>
                <p className="font-semibold text-blue-600">Confirmed</p>
              </div>
            </div>
          </div>

          {/* Order tracking info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 font-medium mb-2">📦 What's Next?</p>
            <ul className="text-xs text-blue-700 space-y-1 text-left">
              <li>• You'll receive order updates via email</li>
              <li>• Track your order in the "My Orders" section</li>
              <li>• Estimated delivery: 3-5 business days</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate("/profile")}
              className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-200 transform hover:scale-105"
            >
              Track My Order
            </button>
            <button
              onClick={handleBackToShopping}
              className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200"
            >
              Continue Shopping
            </button>
          </div>
        </div>
        <ChatbotFloat />
      </div>
    );
  }

  // Check if there are items to checkout
  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-8">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Items to Checkout</h1>
          <p className="text-gray-600 mb-6">
            {isDirectPurchase ? "Please select a product to checkout." : "Your cart is empty. Add some items to proceed."}
          </p>
          <button
            onClick={handleBackToShopping}
            className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
          >
            Back to Shopping
          </button>
        </div>
        <ChatbotFloat />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Checkout</h1>
          <p className="text-gray-300 mb-4">
            {isDirectPurchase ? "Complete your purchase" : `${checkoutItems.length} item${checkoutItems.length > 1 ? 's' : ''} in your order`}
          </p>
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep >= step
                      ? "bg-gray-600 text-white"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {step}
                </div>
                <span
                  className={`ml-2 text-sm ${
                    currentStep >= step ? "text-white font-semibold" : "text-gray-400"
                  }`}
                >
                  {step === 1 && "Customer Info"}
                  {step === 2 && "Shipping Address"}
                  {step === 3 && "Payment"}
                </span>
                {step < 3 && <div className="w-8 h-0.5 bg-gray-600 mx-4"></div>}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow p-6">
              {/* Step 1: Customer Information */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <FaUser className="mr-2" />
                    Customer Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={customerInfo.firstName}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, firstName: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={customerInfo.lastName}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, lastName: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaEnvelope className="inline mr-1" />
                        Email *
                      </label>
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, email: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaPhone className="inline mr-1" />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, phone: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Shipping Address */}
              {currentStep === 2 && (
                <div>
                  <AddressSelector
                    selectedAddress={selectedAddress}
                    onAddressSelect={handleAddressSelect}
                    onAddressChange={setShippingAddress}
                  />
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <FaCreditCard className="mr-2" />
                    Payment Information
                  </h2>

                  {/* Payment Method Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Payment Method
                    </label>
                    <div className="space-y-3">
                      {/* PayPal Payment */}
                      <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                        paymentMethod === "paypal"
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                      }`}>
                        <input
                          type="radio"
                          value="paypal"
                          checked={paymentMethod === "paypal"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-3"
                        />
                        <FaCreditCard className={`mr-3 ${paymentMethod === "paypal" ? "text-blue-600" : "text-gray-500"}`} />
                        <div className="flex-1">
                          <div className="font-medium">PayPal</div>
                          <div className="text-sm text-gray-500">Credit/Debit Card, PayPal Balance</div>
                        </div>
                        {paymentMethod === "paypal" && (
                          <div className="text-blue-600">
                            <FaCheckCircle />
                          </div>
                        )}
                      </label>

                      {/* Cash on Delivery */}
                      <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                        paymentMethod === "cod"
                          ? "border-green-500 bg-green-50 shadow-md"
                          : "border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                      }`}>
                        <input
                          type="radio"
                          value="cod"
                          checked={paymentMethod === "cod"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-3"
                        />
                        <FaMoneyBillWave className={`mr-3 ${paymentMethod === "cod" ? "text-green-600" : "text-gray-500"}`} />
                        <div className="flex-1">
                          <div className="font-medium">Cash on Delivery</div>
                          <div className="text-sm text-gray-500">Pay when you receive</div>
                        </div>
                        {paymentMethod === "cod" && (
                          <div className="text-green-600">
                            <FaCheckCircle />
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Card Details */}
                  {paymentMethod === "card" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          value={cardDetails.cardholderName}
                          onChange={(e) =>
                            setCardDetails({ ...cardDetails, cardholderName: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number *
                        </label>
                        <input
                          type="text"
                          value={cardDetails.cardNumber}
                          onChange={(e) =>
                            setCardDetails({ ...cardDetails, cardNumber: e.target.value })
                          }
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date *
                          </label>
                          <input
                            type="text"
                            value={cardDetails.expiryDate}
                            onChange={(e) =>
                              setCardDetails({ ...cardDetails, expiryDate: e.target.value })
                            }
                            placeholder="MM/YY"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV *
                          </label>
                          <input
                            type="text"
                            value={cardDetails.cvv}
                            onChange={(e) =>
                              setCardDetails({ ...cardDetails, cvv: e.target.value })
                            }
                            placeholder="123"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PayPal Payment */}
                  {paymentMethod === "paypal" && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        You will be redirected to PayPal's secure payment gateway to complete your payment using your preferred method.
                      </p>
                    </div>
                  )}



                  {/* Cash on Delivery */}
                  {paymentMethod === "cod" && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-800">
                        Pay ₹{pricing.total} when your order is delivered. Additional COD charges may apply.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePreviousStep}
                  disabled={currentStep === 1 || loading}
                  className={`px-6 py-2 rounded-lg font-semibold ${
                    currentStep === 1 || loading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  Previous
                </button>

                {currentStep < 3 ? (
                  <button
                    onClick={handleNextStep}
                    disabled={loading}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading || paymentLoading}
                    className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center min-w-[160px] ${
                      loading || paymentLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:scale-105"
                    } text-white`}
                  >
                    {paymentLoading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Preparing...
                      </>
                    ) : loading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="mr-2" />
                        Place Order
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

              {/* Product Details */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {checkoutItems.map((item, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.productImage || item.image}
                        alt={item.productName || item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{item.productName || item.name}</h4>
                        <div className="flex items-center text-xs mt-1">
                          {renderStars(item.productRating || item.rating || 0)}
                          <span className="text-gray-500 ml-1">({item.reviews || 0})</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{item.productCategory || item.category}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-sm text-gray-600">Quantity: {item.quantity}</span>
                      <span className="font-semibold">₹{getItemPrice(item.productPrice || item.price)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-3 flex items-center">
                  <FaTag className="mr-2 text-green-600" />
                  Apply Coupon
                </h4>

                {!appliedCoupon ? (
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={applyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center"
                      >
                        {couponLoading ? <FaSpinner className="animate-spin" /> : "Apply"}
                      </button>
                    </div>

                    {availableCoupons.length > 0 && (
                      <div className="text-xs text-gray-600">
                        Available: {availableCoupons.slice(0, 2).map(c => c.code).join(", ")}
                        {availableCoupons.length > 2 && ` +${availableCoupons.length - 2} more`}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-green-50 p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-green-800">{appliedCoupon.couponCode}</div>
                      <div className="text-xs text-green-600">You saved ₹{appliedCoupon.discount}</div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{pricing.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{pricing.shipping === 0 ? "Free" : `₹${pricing.shipping}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (GST 18%):</span>
                  <span>₹{pricing.tax}</span>
                </div>
                {pricing.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-₹{pricing.discount}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>₹{pricing.total}</span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center text-sm text-gray-600">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <span>Free delivery on orders above ₹1000</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <span>Estimated delivery: 3-5 business days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ChatbotFloat />
    </div>
  );
};

export default Checkout;
