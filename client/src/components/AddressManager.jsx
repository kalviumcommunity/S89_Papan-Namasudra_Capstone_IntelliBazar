import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaHome, FaBuilding, FaCheck } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const AddressManager = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    label: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    type: "home",
    isDefault: false
  });

  // API base URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/addresses`, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setAddresses(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      showError("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  // Load addresses on component mount
  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      label: "",
      firstName: user?.username?.split(' ')[0] || "",
      lastName: user?.username?.split(' ')[1] || "",
      phone: user?.phone || "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      type: "home",
      isDefault: false
    });
    setEditingAddress(null);
    setShowAddForm(false);
  };

  // Handle add new address
  const handleAddAddress = () => {
    setFormData({
      label: "",
      firstName: user?.username?.split(' ')[0] || "",
      lastName: user?.username?.split(' ')[1] || "",
      phone: user?.phone || "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      type: "home",
      isDefault: addresses.length === 0 // First address is default
    });
    setShowAddForm(true);
  };

  // Handle edit address
  const handleEditAddress = (address) => {
    setFormData({
      label: address.label,
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country,
      type: address.type,
      isDefault: address.isDefault
    });
    setEditingAddress(address);
    setShowAddForm(true);
  };

  // Handle save address
  const handleSaveAddress = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.label || !formData.firstName || !formData.lastName || 
        !formData.phone || !formData.address || !formData.city || 
        !formData.state || !formData.pincode) {
      showError("Please fill in all required fields");
      return;
    }

    // Validate pincode
    if (!/^[0-9]{6}$/.test(formData.pincode)) {
      showError("Please enter a valid 6-digit pincode");
      return;
    }

    try {
      setLoading(true);
      
      if (editingAddress) {
        // Update existing address
        const response = await axios.put(`${API_BASE_URL}/addresses/${editingAddress._id}`, formData, {
          headers: getAuthHeaders()
        });

        if (response.data.success) {
          showSuccess("Address updated successfully");
          await fetchAddresses();
          resetForm();
        }
      } else {
        // Create new address
        const response = await axios.post(`${API_BASE_URL}/addresses`, formData, {
          headers: getAuthHeaders()
        });

        if (response.data.success) {
          showSuccess("Address added successfully");
          await fetchAddresses();
          resetForm();
        }
      }
    } catch (error) {
      console.error("Error saving address:", error);
      showError(error.response?.data?.message || "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete address
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete(`${API_BASE_URL}/addresses/${addressId}`, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        showSuccess("Address deleted successfully");
        await fetchAddresses();
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      showError("Failed to delete address");
    } finally {
      setLoading(false);
    }
  };

  // Handle set default address
  const handleSetDefault = async (addressId) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_BASE_URL}/addresses/${addressId}/default`, {}, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        showSuccess("Default address updated");
        await fetchAddresses();
      }
    } catch (error) {
      console.error("Error setting default address:", error);
      showError("Failed to set default address");
    } finally {
      setLoading(false);
    }
  };

  // Get address type icon
  const getAddressTypeIcon = (type) => {
    switch (type) {
      case "home":
        return <FaHome className="text-blue-500" />;
      case "office":
        return <FaBuilding className="text-green-500" />;
      default:
        return <FaMapMarkerAlt className="text-gray-500" />;
    }
  };

  if (loading && addresses.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading addresses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800">Saved Addresses</h3>
        <button
          onClick={handleAddAddress}
          className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
        >
          <FaPlus className="mr-2" />
          Add New Address
        </button>
      </div>

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <FaMapMarkerAlt className="text-gray-400 text-4xl mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-600 mb-2">No Addresses Saved</h4>
          <p className="text-gray-500 mb-4">Add your first address to get started</p>
          <button
            onClick={handleAddAddress}
            className="bg-gray-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition"
          >
            Add Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`p-4 border-2 rounded-lg ${
                address.isDefault ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getAddressTypeIcon(address.type)}
                  <span className="font-semibold text-gray-800">{address.label}</span>
                  {address.isDefault && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                      <FaCheck className="mr-1" />
                      Default
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-semibold text-gray-800">{address.fullName}</p>
                <p>{address.formattedAddress}</p>
                <p>Phone: {address.phone}</p>
              </div>
              
              {!address.isDefault && (
                <button
                  onClick={() => handleSetDefault(address._id)}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Set as Default
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Address Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingAddress ? "Edit Address" : "Add New Address"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSaveAddress} className="space-y-4">
                {/* Address Label and Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address Label *
                    </label>
                    <input
                      type="text"
                      value={formData.label}
                      onChange={(e) => handleInputChange('label', e.target.value)}
                      placeholder="e.g., Home, Office"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                    >
                      <option value="home">Home</option>
                      <option value="office">Office</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                    required
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="House/Flat No., Street, Area"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 h-20 resize-none"
                    required
                  />
                </div>

                {/* City, State, Pincode */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      placeholder="6 digits"
                      maxLength="6"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                      required
                    />
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                  />
                </div>

                {/* Default Address Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="isDefault" className="text-sm text-gray-700">
                    Set as default address
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition disabled:opacity-50"
                  >
                    {loading ? "Saving..." : editingAddress ? "Update Address" : "Add Address"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressManager;
