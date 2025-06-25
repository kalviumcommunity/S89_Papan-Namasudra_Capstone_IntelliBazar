import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaImage,
  FaSave,
  FaTimes,
  FaBox,
  FaChartBar,
  FaUsers,
  FaDollarSign,
  FaSignOutAlt,
  FaShieldAlt
} from 'react-icons/fa';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Admin authentication state
  const [adminUser, setAdminUser] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // State management
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stats, setStats] = useState({});
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'electronics',
    stock: '',
    specifications: {
      brand: '',
      model: '',
      color: '',
      size: '',
      weight: '',
      warranty: '',
      features: []
    },
    tags: '',
    originalPrice: '',
    discountPercentage: 0
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  // Categories
  const categories = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'watches', label: 'Watches' },
    { value: 'footwear', label: 'Footwear' },
    { value: 'home-decor', label: 'Home Decor' },
    { value: 'books', label: 'Books' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'sports', label: 'Sports' }
  ];

  // Check admin authentication
  useEffect(() => {
    checkAdminAuthentication();
  }, [navigate]);

  const checkAdminAuthentication = async () => {
    setCheckingAuth(true);

    const storedAdminToken = localStorage.getItem('adminToken');
    const storedAdminUser = localStorage.getItem('adminUser');

    if (storedAdminToken && storedAdminUser) {
      try {
        // Verify admin token
        const response = await fetch('/api/seller/verify', {
          headers: {
            'Authorization': `Bearer ${storedAdminToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setAdminUser(data.adminUser);
          setAdminToken(storedAdminToken);

          // Load dashboard data
          fetchProducts();
          fetchStats();
        } else {
          // Invalid token, redirect to admin login
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          navigate('/admin-login');
        }
      } catch (error) {
        console.error('Admin auth verification failed:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin-login');
      }
    } else {
      // No admin token, redirect to admin login
      navigate('/admin-login');
    }

    setCheckingAuth(false);
  };

  // Handle admin logout
  const handleAdminLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
    } catch (error) {
      console.error('Admin logout error:', error);
    }

    // Clear admin session
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdminUser(null);
    setAdminToken(null);

    // Redirect to admin login
    navigate('/admin-login');
  };

  // API calls with admin authentication
  const fetchProducts = async () => {
    if (!adminToken) return;

    setLoading(true);
    try {
      const response = await fetch('/api/products/seller', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/products/categories/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('specifications.')) {
      const specField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'electronics',
      stock: '',
      specifications: {
        brand: '',
        model: '',
        color: '',
        size: '',
        weight: '',
        warranty: '',
        features: []
      },
      tags: '',
      originalPrice: '',
      discountPercentage: 0
    });
    setSelectedImages([]);
    setImagePreview([]);
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const formDataToSend = new FormData();
      
      // Append form fields
      Object.keys(formData).forEach(key => {
        if (key === 'specifications') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Append images
      selectedImages.forEach(image => {
        formDataToSend.append('images', image);
      });

      const url = editingProduct 
        ? `/api/products/${editingProduct._id}` 
        : '/api/products';
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        await fetchProducts();
        resetForm();
        alert(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error saving product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      specifications: product.specifications || {
        brand: '',
        model: '',
        color: '',
        size: '',
        weight: '',
        warranty: '',
        features: []
      },
      tags: product.tags ? product.tags.join(', ') : '',
      originalPrice: product.originalPrice?.toString() || '',
      discountPercentage: product.discountPercentage || 0
    });
    setShowAddForm(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchProducts();
        alert('Product deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error deleting product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  // Render dashboard stats
  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            <FaBox />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Products</p>
            <p className="text-2xl font-semibold text-gray-900">{products.length}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600">
            <FaDollarSign />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Value</p>
            <p className="text-2xl font-semibold text-gray-900">
              ₹{products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
            <FaChartBar />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Categories</p>
            <p className="text-2xl font-semibold text-gray-900">
              {new Set(products.map(p => p.category)).size}
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600">
            <FaEye />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Views</p>
            <p className="text-2xl font-semibold text-gray-900">
              {products.reduce((sum, p) => sum + (p.views || 0), 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render product form
  const renderProductForm = () => (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </h3>
        <button
          onClick={resetForm}
          className="text-gray-500 hover:text-gray-700"
        >
          <FaTimes />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (₹) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Quantity
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Original Price (₹)
            </label>
            <input
              type="number"
              name="originalPrice"
              value={formData.originalPrice}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Percentage
            </label>
            <input
              type="number"
              name="discountPercentage"
              value={formData.discountPercentage}
              onChange={handleInputChange}
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            placeholder="Enter product description"
          />
        </div>

        {/* Specifications */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Specifications</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input
                type="text"
                name="specifications.brand"
                value={formData.specifications.brand}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="Brand name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                type="text"
                name="specifications.model"
                value={formData.specifications.model}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="Model number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input
                type="text"
                name="specifications.color"
                value={formData.specifications.color}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="Color"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
              <input
                type="text"
                name="specifications.size"
                value={formData.specifications.size}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="Size"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
              <input
                type="text"
                name="specifications.weight"
                value={formData.specifications.weight}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="Weight"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warranty</label>
              <input
                type="text"
                name="specifications.warranty"
                value={formData.specifications.warranty}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="Warranty period"
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            placeholder="tag1, tag2, tag3"
          />
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images {!editingProduct && '*'}
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            required={!editingProduct}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          />
          {imagePreview.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {imagePreview.map((preview, index) => (
                <img
                  key={index}
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border"
                />
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 flex items-center"
          >
            <FaSave className="mr-2" />
            {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
          </button>
        </div>
      </form>
    </div>
  );

  // Render products list
  const renderProductsList = () => (
    <div className="bg-white rounded-xl shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">My Products</h3>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition flex items-center"
          >
            <FaPlus className="mr-2" />
            Add Product
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src={product.primaryImage || product.images?.[0]?.url}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover mr-4"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Views: {product.views || 0}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{product.price.toLocaleString()}
                  {product.discountPercentage > 0 && (
                    <div className="text-xs text-green-600">
                      {product.discountPercentage}% off
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.stock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && !loading && (
          <div className="text-center py-12">
            <FaBox className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first product.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition flex items-center mx-auto"
              >
                <FaPlus className="mr-2" />
                Add Product
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Show loading while checking admin auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If no admin user, the useEffect will redirect to login
  if (!adminUser) {
    return null;
  }

  // Main dashboard render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-300">
              Welcome back, {adminUser?.name} ({adminUser?.businessName})
            </p>
          </div>

          {/* Admin Info & Logout */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-white text-sm font-medium">{adminUser?.email}</p>
              <p className="text-gray-400 text-xs">Admin</p>
            </div>
            <button
              onClick={handleAdminLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition flex items-center"
              title="Admin Logout"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-white text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-white text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'products' && (
          <>
            {renderStats()}
            {showAddForm && renderProductForm()}
            {renderProductsList()}
          </>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>
            <p className="text-gray-600">Analytics features coming soon...</p>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
