// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  FaEnvelope,
  FaShoppingBag,
  FaHeart,
  FaShoppingCart,
  FaSignOutAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPhone,
  FaUserCircle,
  FaChartLine,
  FaCrown,
  FaGift,
  FaCamera,
  FaUpload,
  FaTrash,
  FaBoxOpen,
  FaClock,
  FaCheckCircle,
  FaSpinner,
  FaTruck,
  FaTimesCircle,
  FaEye,
  FaCreditCard,
  FaUser,
  FaReceipt
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import ChatbotFloat from "../components/ChatbotFloat";

const Profile = () => {
  const { user, setUser, loading } = useAuth();
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();

  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  // Order state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    if (user) {
      setEditedUser({
        username: user.username || user.displayName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:8080/api/auth/logout", {
        withCredentials: true,
      });

      // Clear auth state and token (for manual login)
      setUser(null);
      localStorage.removeItem("token");

      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // Reset to original values if canceling
      setEditedUser({
        username: user.username || user.displayName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || ''
      });
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError('');
      setSaveMessage('');

      const token = localStorage.getItem("token");
      if (!token) {
        setSaveError('Authentication required. Please log in again.');
        return;
      }

      const profileData = {
        username: editedUser.username,
        email: editedUser.email,
        phone: editedUser.phone || '',
        address: editedUser.address || '',
        bio: editedUser.bio || '',
        profilePhoto: profilePhoto || ''
      };

      const response = await axios.put(
        "http://localhost:8080/api/auth/profile",
        profileData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.data.user) {
        setUser(response.data.user);
        setSaveMessage('Profile updated successfully!');
        setIsEditing(false);

        setTimeout(() => {
          setSaveMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);

      if (error.response?.status === 401) {
        setSaveError('Session expired. Please log in again.');
        setTimeout(() => {
          localStorage.removeItem("token");
          setUser(null);
          navigate("/login");
        }, 2000);
      } else if (error.response?.status === 400) {
        setSaveError(error.response.data.message || 'Invalid data provided.');
      } else if (error.response?.status === 500) {
        setSaveError('Server error. Please try again later.');
      } else {
        setSaveError('Failed to update profile. Please check your connection and try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate user stats - safely handle price extraction
  const totalCartValue = cartItems.reduce((sum, item) => {
    try {
      // Handle both productPrice (from database) and price (legacy) properties
      const priceString = item.productPrice || item.price || '₹0';
      const price = parseFloat(priceString.replace(/[^\d.]/g, '')) || 0;
      return sum + (price * (item.quantity || 1));
    } catch (error) {
      console.warn('Error calculating cart item price:', error, item);
      return sum;
    }
  }, 0);

  const memberSince = user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear();

  // Photo handling functions
  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhoto(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
  };

  // API base URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch user orders
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await axios.get(`${API_BASE_URL}/orders`, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch orders when user changes or orders tab is active
  useEffect(() => {
    if (user && activeTab === 'orders') {
      fetchOrders();
    }
  }, [user, activeTab]);

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
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
          <div className="text-center">
            <FaUserCircle className="text-6xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Your Profile</h2>
            <p className="text-gray-600 mb-6">Please log in to view and manage your profile information.</p>
            <Link
              to="/login"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              Login Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {(user.username || user.displayName || 'U').charAt(0).toUpperCase()}
              </div>

            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="text-3xl font-bold text-gray-800 bg-gray-100 px-3 py-2 rounded-lg border-2 border-blue-300 focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-gray-800">
                    {user.username || user.displayName}
                  </h1>
                )}

                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSave}
                        className={`text-white p-2 rounded-lg transition-colors ${
                          isSaving
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        <FaSave />
                      </button>
                      <button
                        onClick={handleEditToggle}
                        className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <FaTimes />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleEditToggle}
                      className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <FaEdit />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <FaEnvelope className="text-blue-500" />
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedUser.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="bg-gray-100 px-2 py-1 rounded border-2 border-blue-300 focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <span>{user.email}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-green-500" />
                  <span>Member since {memberSince}</span>
                </div>
              </div>

              {isEditing && (
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-purple-500" />
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={editedUser.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="bg-gray-100 px-2 py-1 rounded border-2 border-blue-300 focus:outline-none focus:border-blue-500 flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-red-500" />
                    <input
                      type="text"
                      placeholder="Address"
                      value={editedUser.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="bg-gray-100 px-2 py-1 rounded border-2 border-blue-300 focus:outline-none focus:border-blue-500 flex-1"
                    />
                  </div>
                  <textarea
                    placeholder="Bio"
                    value={editedUser.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="w-full bg-gray-100 px-2 py-1 rounded border-2 border-blue-300 focus:outline-none focus:border-blue-500 h-20 resize-none"
                  />
                </div>
              )}

              {!isEditing && (user.phone || user.address || user.bio) && (
                <div className="space-y-2 mb-4 text-gray-600">
                  {user.phone && (
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-purple-500" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.address && (
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-red-500" />
                      <span>{user.address}</span>
                    </div>
                  )}
                  {user.bio && (
                    <p className="text-gray-700 italic">{user.bio}</p>
                  )}
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center gap-2 shadow-lg"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {saveMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-8 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {saveMessage}
          </div>
        )}

        {saveError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {saveError}
          </div>
        )}

        {/* Profile Information Summary */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaUserCircle className="text-blue-500" />
            Profile Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Details */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2">Personal Details</h4>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaUserCircle className="text-blue-500 text-lg" />
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-semibold text-gray-800">{user.username || user.displayName || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaEnvelope className="text-green-500 text-lg" />
                  <div>
                    <p className="text-sm text-gray-600">Email Address</p>
                    <p className="font-semibold text-gray-800">{user.email || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaPhone className="text-purple-500 text-lg" />
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="font-semibold text-gray-800">{user.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2">Additional Information</h4>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaMapMarkerAlt className="text-red-500 text-lg mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-semibold text-gray-800">{user.address || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaCalendarAlt className="text-orange-500 text-lg mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="font-semibold text-gray-800">{memberSince}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaEdit className="text-indigo-500 text-lg mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Bio</p>
                    <p className="font-semibold text-gray-800">{user.bio || 'No bio added yet'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Completion */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-semibold text-gray-800">Profile Completion</h5>
                <p className="text-sm text-gray-600">Complete your profile to get the best experience</p>
              </div>
              <div className="text-right">
                {(() => {
                  const fields = [user.username, user.email, user.phone, user.address, user.bio, profilePhoto];
                  const completed = fields.filter(field => field && (typeof field === 'string' ? field.trim() !== '' : field !== null)).length;
                  const percentage = Math.round((completed / fields.length) * 100);
                  return (
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{percentage}%</p>
                      <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FaShoppingCart className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Cart Items</p>
                <p className="text-2xl font-bold text-gray-800">{cartItems.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <FaHeart className="text-red-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Wishlist</p>
                <p className="text-2xl font-bold text-gray-800">{wishlistItems.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <FaChartLine className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Cart Value</p>
                <p className="text-2xl font-bold text-gray-800">₹{totalCartValue.toFixed(0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <FaGift className="text-purple-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Rewards</p>
                <p className="text-2xl font-bold text-gray-800">125</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-2xl mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {[
                { id: 'overview', label: 'Overview', icon: FaChartLine },
                { id: 'orders', label: 'Orders', icon: FaShoppingBag },
                { id: 'wishlist', label: 'Wishlist', icon: FaHeart },
                { id: 'settings', label: 'Settings', icon: FaEdit }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Account Overview</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                    <h4 className="text-lg font-semibold text-blue-800 mb-4">Recent Activity</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-blue-700">Added items to cart</span>
                        <span className="text-blue-500 text-sm ml-auto">Today</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-blue-700">Updated wishlist</span>
                        <span className="text-blue-500 text-sm ml-auto">Yesterday</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-blue-700">Profile updated</span>
                        <span className="text-blue-500 text-sm ml-auto">2 days ago</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                    <h4 className="text-lg font-semibold text-green-800 mb-4">Quick Actions</h4>
                    <div className="space-y-3">
                      <Link
                        to="/shop"
                        className="flex items-center gap-3 text-green-700 hover:text-green-800 transition-colors"
                      >
                        <FaShoppingBag />
                        <span>Continue Shopping</span>
                      </Link>
                      <Link
                        to="/cart"
                        className="flex items-center gap-3 text-green-700 hover:text-green-800 transition-colors"
                      >
                        <FaShoppingCart />
                        <span>View Cart ({cartItems.length})</span>
                      </Link>
                      <Link
                        to="/wishlist"
                        className="flex items-center gap-3 text-green-700 hover:text-green-800 transition-colors"
                      >
                        <FaHeart />
                        <span>View Wishlist ({wishlistItems.length})</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center">
                      <FaShoppingBag className="text-white text-lg" />
                    </div>
                    Order History
                  </h3>
                  <div className="text-sm text-gray-300">
                    {orders.length} {orders.length === 1 ? 'order' : 'orders'} found
                  </div>
                </div>
                {ordersLoading ? (
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 text-center border border-gray-700">
                    <FaSpinner className="text-4xl text-gray-300 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-300">Loading your orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-gray-50 p-8 rounded-xl text-center">
                    <FaBoxOpen className="text-4xl text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-600 mb-2">No Orders Yet</h4>
                    <p className="text-gray-500 mb-4">Start shopping to see your order history here.</p>
                    <Link
                      to="/shop"
                      className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
                    >
                      <FaShoppingBag />
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const statusInfo = getStatusInfo(order.status);
                      const StatusIcon = statusInfo.icon;

                      return (
                        <div key={order._id} className="bg-white rounded-xl shadow-lg p-6">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4 mb-4">
                                <div className="flex-1">
                                  <h4 className="text-lg font-semibold text-gray-800">
                                    Order #{order.tracking.orderNumber}
                                  </h4>
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

                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-6">
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
                                <button
                                  onClick={() => viewOrderDetails(order)}
                                  className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
                                >
                                  <FaEye className="mr-2" />
                                  View Details
                                </button>
                              </div>

                              {/* Product Preview */}
                              <div className="flex items-center space-x-3">
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
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Your Wishlist</h3>
                {wishlistItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.slice(0, 6).map((item, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-40 object-cover rounded-lg mb-3"
                        />
                        <h4 className="font-semibold text-gray-800 mb-2">{item.name}</h4>
                        <p className="text-blue-600 font-bold mb-3">{item.price}</p>
                        <div className="flex gap-2">
                          <button className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-600 transition-colors">
                            Add to Cart
                          </button>
                          <button className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-colors">
                            <FaHeart />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-8 rounded-xl text-center">
                    <FaHeart className="text-4xl text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-600 mb-2">Your Wishlist is Empty</h4>
                    <p className="text-gray-500 mb-4">Save items you love to your wishlist.</p>
                    <Link
                      to="/shop"
                      className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors inline-flex items-center gap-2"
                    >
                      <FaHeart />
                      Browse Products
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FaEdit className="text-yellow-600 text-xl" />
                    <h4 className="text-lg font-semibold text-yellow-800">Profile Settings</h4>
                  </div>
                  <p className="text-yellow-700 mb-4">
                    Use the edit button in the profile header above to update your personal information.
                  </p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-yellow-200">
                      <span className="text-yellow-800">Email Notifications</span>
                      <button className="bg-yellow-500 text-white px-4 py-1 rounded-full text-sm">Enabled</button>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-yellow-200">
                      <span className="text-yellow-800">SMS Notifications</span>
                      <button className="bg-gray-300 text-gray-600 px-4 py-1 rounded-full text-sm">Disabled</button>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-yellow-800">Marketing Emails</span>
                      <button className="bg-yellow-500 text-white px-4 py-1 rounded-full text-sm">Enabled</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photo Upload Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Change Profile Photo</h3>

            <div className="space-y-4">
              <div className="flex justify-center">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Current profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {(user.username || user.displayName || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer text-center flex items-center justify-center gap-2">
                    <FaUpload />
                    Upload New Photo
                  </div>
                </label>

                {profilePhoto && (
                  <button
                    onClick={handleRemovePhoto}
                    className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaTrash />
                    Remove Photo
                  </button>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-white rounded-t-2xl p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaShoppingBag className="text-2xl text-gray-700" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Order Details</h3>
                    <p className="text-gray-600">Order #{selectedOrder.tracking.orderNumber}</p>
                  </div>
                </div>
                <button
                  onClick={closeOrderDetails}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Order Status & Timeline */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FaTruck className="text-blue-600" />
                    Order Status
                  </h4>
                  <div className={`flex items-center px-4 py-2 rounded-full ${getStatusInfo(selectedOrder.status).bg}`}>
                    {(() => {
                      const StatusIcon = getStatusInfo(selectedOrder.status).icon;
                      return <StatusIcon className={`${getStatusInfo(selectedOrder.status).color} mr-2`} />;
                    })()}
                    <span className={`font-semibold ${getStatusInfo(selectedOrder.status).color}`}>
                      {getStatusInfo(selectedOrder.status).text}
                    </span>
                  </div>
                </div>

                {/* Order Timeline */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <FaCheckCircle className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">Order Placed</p>
                      <p className="text-sm text-gray-600">{formatDate(selectedOrder.createdAt)}</p>
                    </div>
                  </div>

                  {selectedOrder.status !== 'pending' && (
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaCheckCircle className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">Order Confirmed</p>
                        <p className="text-sm text-gray-600">Your order has been confirmed</p>
                      </div>
                    </div>
                  )}

                  {['processing', 'shipped', 'delivered'].includes(selectedOrder.status) && (
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <FaSpinner className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">Processing</p>
                        <p className="text-sm text-gray-600">Your order is being prepared</p>
                      </div>
                    </div>
                  )}

                  {['shipped', 'delivered'].includes(selectedOrder.status) && (
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <FaTruck className="text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">Shipped</p>
                        <p className="text-sm text-gray-600">
                          {selectedOrder.tracking.trackingNumber
                            ? `Tracking: ${selectedOrder.tracking.trackingNumber}`
                            : 'Your order is on the way'
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedOrder.status === 'delivered' && (
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <FaCheckCircle className="text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">Delivered</p>
                        <p className="text-sm text-gray-600">Your order has been delivered</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Estimated Delivery */}
                {selectedOrder.tracking.estimatedDelivery && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-blue-600" />
                      <span className="font-semibold text-blue-800">
                        Estimated Delivery: {formatDate(selectedOrder.tracking.estimatedDelivery)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {/* Products */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaShoppingBag className="text-green-600" />
                  Products ({selectedOrder.products.length} item{selectedOrder.products.length > 1 ? 's' : ''})
                </h4>
                <div className="space-y-4">
                  {selectedOrder.products.map((product, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={product.productImage}
                        alt={product.productName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-800">{product.productName}</h5>
                        <p className="text-sm text-gray-600">Category: {product.productCategory}</p>
                        <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-800">₹{product.productPrice}</p>
                        <p className="text-sm text-gray-600">
                          Total: ₹{(parseFloat(product.productPrice.replace(/[^\d.]/g, '')) * product.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer & Shipping Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaUser className="text-blue-600" />
                    Customer Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-semibold text-gray-800">
                        {selectedOrder.customerInfo.firstName} {selectedOrder.customerInfo.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-800">{selectedOrder.customerInfo.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold text-gray-800">{selectedOrder.customerInfo.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-red-600" />
                    Shipping Address
                  </h4>
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-800">{selectedOrder.shippingAddress.address}</p>
                    <p className="text-gray-600">
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}
                    </p>
                    <p className="text-gray-600">
                      {selectedOrder.shippingAddress.pincode}, {selectedOrder.shippingAddress.country}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaReceipt className="text-purple-600" />
                  Order Summary
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">₹{selectedOrder.pricing.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-semibold">₹{selectedOrder.pricing.shipping}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-semibold">₹{selectedOrder.pricing.tax}</span>
                  </div>
                  {selectedOrder.pricing.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span className="font-semibold">-₹{selectedOrder.pricing.discount}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount:</span>
                      <span>₹{selectedOrder.pricing.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaCreditCard className="text-gray-600" />
                      <span className="font-semibold text-gray-800">Payment Method</span>
                    </div>
                    <span className="font-semibold text-gray-800 capitalize">{selectedOrder.payment.method}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-600">Payment Status</span>
                    <span className={`font-semibold ${
                      selectedOrder.payment.status === 'completed' ? 'text-green-600' :
                      selectedOrder.payment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {selectedOrder.payment.status.charAt(0).toUpperCase() + selectedOrder.payment.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ChatbotFloat />
    </div>
  );
};

export default Profile;
