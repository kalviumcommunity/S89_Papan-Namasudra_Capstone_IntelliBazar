import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBox, FaEye, FaSpinner, FaCheckCircle, FaClock, FaTruck, FaTimesCircle, FaShippingFast, FaClipboardCheck } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import ChatbotFloat from "../components/ChatbotFloat";
import axios from "axios";

const OrderHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError } = useToast();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // API base URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
  
  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch orders on component mount
  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch user orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/orders`, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      showError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Get status icon and color
  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { icon: FaClock, color: "text-yellow-600", bg: "bg-yellow-100", text: "Pending" },
      confirmed: { icon: FaCheckCircle, color: "text-blue-600", bg: "bg-blue-100", text: "Confirmed" },
      processing: { icon: FaSpinner, color: "text-purple-600", bg: "bg-purple-100", text: "Processing" },
      shipped: { icon: FaTruck, color: "text-indigo-600", bg: "bg-indigo-100", text: "Shipped" },
      delivered: { icon: FaCheckCircle, color: "text-green-600", bg: "bg-green-100", text: "Delivered" },
      cancelled: { icon: FaTimesCircle, color: "text-red-600", bg: "bg-red-100", text: "Cancelled" }
    };
    return statusMap[status] || statusMap.pending;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Order tracking timeline component
  const OrderTrackingTimeline = ({ order }) => {
    const timeline = [
      {
        status: "pending",
        title: "Order Placed",
        description: "Your order has been placed successfully",
        icon: FaClipboardCheck,
        completed: true,
        date: order.createdAt
      },
      {
        status: "confirmed",
        title: "Order Confirmed",
        description: "Your order has been confirmed and is being prepared",
        icon: FaCheckCircle,
        completed: ["confirmed", "processing", "shipped", "delivered"].includes(order.status),
        date: ["confirmed", "processing", "shipped", "delivered"].includes(order.status) ? order.updatedAt : null
      },
      {
        status: "processing",
        title: "Processing",
        description: "Your order is being processed and packed",
        icon: FaSpinner,
        completed: ["processing", "shipped", "delivered"].includes(order.status),
        date: ["processing", "shipped", "delivered"].includes(order.status) ? order.updatedAt : null
      },
      {
        status: "shipped",
        title: "Shipped",
        description: "Your order has been shipped",
        icon: FaShippingFast,
        completed: ["shipped", "delivered"].includes(order.status),
        date: ["shipped", "delivered"].includes(order.status) ? order.updatedAt : null
      },
      {
        status: "delivered",
        title: "Delivered",
        description: "Your order has been delivered",
        icon: FaCheckCircle,
        completed: order.status === "delivered",
        date: order.status === "delivered" ? order.updatedAt : null
      }
    ];

    return (
      <div className="mb-6">
        <h3 className="font-semibold mb-4">Order Tracking</h3>
        <div className="relative">
          {timeline.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === timeline.length - 1;

            return (
              <div key={step.status} className="flex items-start mb-4">
                <div className="flex flex-col items-center mr-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.completed
                      ? 'bg-green-500 text-white'
                      : order.status === step.status
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                  }`}>
                    <Icon className="text-sm" />
                  </div>
                  {!isLast && (
                    <div className={`w-0.5 h-8 mt-2 ${
                      step.completed ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <h4 className={`font-semibold ${
                    step.completed ? 'text-green-600' : order.status === step.status ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-1">{step.description}</p>
                  {step.date && (
                    <p className="text-xs text-gray-500">
                      {formatDate(step.date)}
                    </p>
                  )}
                  {order.status === "shipped" && step.status === "shipped" && order.tracking?.estimatedDelivery && (
                    <p className="text-xs text-blue-600 mt-1">
                      Estimated delivery: {formatDate(order.tracking.estimatedDelivery)}
                    </p>
                  )}
                  {order.tracking?.trackingNumber && step.status === "shipped" && step.completed && (
                    <p className="text-xs text-gray-600 mt-1">
                      Tracking: {order.tracking.trackingNumber}
                      {order.tracking.carrier && ` (${order.tracking.carrier})`}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Close order details modal
  const closeOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-white text-6xl mx-auto mb-4 animate-spin" />
          <p className="text-white text-lg">Loading your orders...</p>
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
          <h1 className="text-3xl font-bold text-white mb-2">Order History</h1>
          <p className="text-gray-300">Track and manage your orders</p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <FaBox className="text-gray-400 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start shopping to see your orders here.</p>
            <button
              onClick={() => navigate("/shop")}
              className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div key={order._id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800">
                            Order #{order.tracking.orderNumber}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className={`flex items-center px-3 py-1 rounded-full ${statusInfo.bg}`}>
                          <StatusIcon className={`${statusInfo.color} mr-2`} />
                          <span className={`text-sm font-semibold ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Items</p>
                          <p className="font-semibold">{order.products.length} item{order.products.length > 1 ? 's' : ''}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="font-semibold text-lg">₹{order.pricing.totalAmount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Payment Method</p>
                          <p className="font-semibold capitalize">{order.payment.method}</p>
                        </div>
                      </div>
                      
                      {/* Product Preview */}
                      <div className="flex items-center space-x-3 mb-4">
                        {order.products.slice(0, 3).map((product, index) => (
                          <img
                            key={index}
                            src={product.productImage}
                            alt={product.productName}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ))}
                        {order.products.length > 3 && (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-semibold text-gray-600">
                              +{order.products.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 mt-4 lg:mt-0">
                      <button
                        onClick={() => viewOrderDetails(order)}
                        className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
                      >
                        <FaEye className="mr-2" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Order Details - #{selectedOrder.tracking.orderNumber}
                  </h2>
                  <button
                    onClick={closeOrderDetails}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Order Tracking Timeline */}
                <OrderTrackingTimeline order={selectedOrder} />

                {/* Order Status and Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Order Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Order Date:</span>
                        <span>{formatDate(selectedOrder.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={`font-semibold ${getStatusInfo(selectedOrder.status).color}`}>
                          {getStatusInfo(selectedOrder.status).text}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Method:</span>
                        <span className="capitalize">{selectedOrder.payment.method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Status:</span>
                        <span className={`font-semibold ${selectedOrder.payment.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {selectedOrder.payment.status.charAt(0).toUpperCase() + selectedOrder.payment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Shipping Address</h3>
                    <div className="text-sm">
                      <p className="font-semibold">{selectedOrder.customerInfo.firstName} {selectedOrder.customerInfo.lastName}</p>
                      <p>{selectedOrder.shippingAddress.address}</p>
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.pincode}</p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                      <p className="mt-2">Phone: {selectedOrder.customerInfo.phone}</p>
                    </div>
                  </div>
                </div>
                
                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.products.map((product, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                        <img
                          src={product.productImage}
                          alt={product.productName}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{product.productName}</h4>
                          <p className="text-sm text-gray-600">{product.productCategory}</p>
                          <p className="text-sm">Quantity: {product.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{typeof product.productPrice === 'string' ? product.productPrice.replace(/[^\d]/g, '') : product.productPrice}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Order Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{selectedOrder.pricing.subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>{selectedOrder.pricing.shipping === 0 ? 'Free' : `₹${selectedOrder.pricing.shipping}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (GST):</span>
                      <span>₹{selectedOrder.pricing.tax}</span>
                    </div>
                    {selectedOrder.pricing.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount{selectedOrder.pricing.couponCode ? ` (${selectedOrder.pricing.couponCode})` : ''}:</span>
                        <span>-₹{selectedOrder.pricing.discount}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span>₹{selectedOrder.pricing.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <ChatbotFloat />
    </div>
  );
};

export default OrderHistory;
