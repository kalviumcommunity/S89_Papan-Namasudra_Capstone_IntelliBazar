import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShieldAlt, FaEye, FaEyeSlash, FaSpinner, FaUser, FaEnvelope, FaBuilding, FaIdCard, FaCalendarAlt } from "react-icons/fa";

const AdminRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    businessName: "",
    age: "",
    aadharCard: "",
    panCard: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Business name suggestions
  const businessSuggestions = [
    "Tech Solutions Pvt Ltd",
    "Digital Commerce Co",
    "E-Commerce Ventures",
    "Online Retail Hub",
    "Smart Business Solutions",
    "Digital Marketplace Co",
    "Modern Trade Solutions",
    "Innovative Commerce Ltd",
    "Digital Business Hub",
    "Smart Retail Solutions"
  ];

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }

    // Calculate password strength
    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Name validation
    if (!formData.name) {
      newErrors.name = "Name is required";
    }

    // Business name validation
    if (!formData.businessName) {
      newErrors.businessName = "Business name is required";
    }

    // Age validation
    if (!formData.age) {
      newErrors.age = "Age is required";
    } else if (parseInt(formData.age) < 18 || parseInt(formData.age) > 100) {
      newErrors.age = "Age must be between 18 and 100";
    }

    // Aadhar card validation
    if (!formData.aadharCard) {
      newErrors.aadharCard = "Aadhar card number is required";
    } else if (!/^\d{12}$/.test(formData.aadharCard)) {
      newErrors.aadharCard = "Aadhar card must be 12 digits";
    }

    // PAN card validation
    if (!formData.panCard) {
      newErrors.panCard = "PAN card number is required";
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panCard.toUpperCase())) {
      newErrors.panCard = "PAN card format is invalid (e.g., ABCDE1234F)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/seller/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        // Show success message and redirect
        navigate("/admin-login", {
          state: {
            message: "Admin account created successfully! Please log in with your credentials."
          }
        });
      } else {
        setErrors({ general: data.message || "Registration failed" });
      }
    } catch (error) {
      console.error("Admin registration error:", error);
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 3) return "Medium";
    return "Strong";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left: Admin Info Section */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-800 to-gray-900 p-12 items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 text-center text-white">
              <FaShieldAlt className="text-6xl mb-6 mx-auto opacity-90" />
              <h3 className="text-4xl font-bold mb-4">Admin Registration</h3>
              <p className="text-xl opacity-90 leading-relaxed mb-6">
                Join IntelliBazar as an admin and manage your business with our powerful dashboard tools.
              </p>
              <div className="space-y-3 text-left">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span>Product Management</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span>Order Tracking</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span>Analytics Dashboard</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span>Customer Management</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Registration Form */}
          <div className="w-full lg:w-1/2 p-8 lg:p-12">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <FaShieldAlt className="text-4xl text-gray-400 mr-3" />
                  <span className="text-3xl font-bold bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
                    Admin Portal
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Create Admin Account</h2>
                <p className="text-gray-300">Register to access the admin dashboard</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.general && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-400 text-sm">{errors.general}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="md:col-span-2">
                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${
                          errors.email ? 'border-red-500/50' : 'border-white/20'
                        }`}
                        disabled={loading}
                      />
                    </div>
                    {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                  </div>

                  {/* Name */}
                  <div>
                    <div className="relative">
                      <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${
                          errors.name ? 'border-red-500/50' : 'border-white/20'
                        }`}
                        disabled={loading}
                      />
                    </div>
                    {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                  </div>

                  {/* Age */}
                  <div>
                    <div className="relative">
                      <FaCalendarAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        name="age"
                        placeholder="Age"
                        value={formData.age}
                        onChange={handleChange}
                        min="18"
                        max="100"
                        className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${
                          errors.age ? 'border-red-500/50' : 'border-white/20'
                        }`}
                        disabled={loading}
                      />
                    </div>
                    {errors.age && <p className="text-red-400 text-sm mt-1">{errors.age}</p>}
                  </div>
                </div>

                {/* Business Name with Suggestions */}
                <div>
                  <div className="relative">
                    <FaBuilding className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="businessName"
                      placeholder="Business Name"
                      value={formData.businessName}
                      onChange={handleChange}
                      list="business-suggestions"
                      className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${
                        errors.businessName ? 'border-red-500/50' : 'border-white/20'
                      }`}
                      disabled={loading}
                    />
                    <datalist id="business-suggestions">
                      {businessSuggestions.map((suggestion, index) => (
                        <option key={index} value={suggestion} />
                      ))}
                    </datalist>
                  </div>
                  {errors.businessName && <p className="text-red-400 text-sm mt-1">{errors.businessName}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Aadhar Card */}
                  <div>
                    <div className="relative">
                      <FaIdCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="aadharCard"
                        placeholder="Aadhar Card (12 digits)"
                        value={formData.aadharCard}
                        onChange={handleChange}
                        maxLength="12"
                        className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${
                          errors.aadharCard ? 'border-red-500/50' : 'border-white/20'
                        }`}
                        disabled={loading}
                      />
                    </div>
                    {errors.aadharCard && <p className="text-red-400 text-sm mt-1">{errors.aadharCard}</p>}
                  </div>

                  {/* PAN Card */}
                  <div>
                    <div className="relative">
                      <FaIdCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="panCard"
                        placeholder="PAN Card (ABCDE1234F)"
                        value={formData.panCard}
                        onChange={handleChange}
                        maxLength="10"
                        style={{ textTransform: 'uppercase' }}
                        className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${
                          errors.panCard ? 'border-red-500/50' : 'border-white/20'
                        }`}
                        disabled={loading}
                      />
                    </div>
                    {errors.panCard && <p className="text-red-400 text-sm mt-1">{errors.panCard}</p>}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-4 bg-white/10 border rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${
                        errors.password ? 'border-red-500/50' : 'border-white/20'
                      }`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                      disabled={loading}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-400">{getPasswordStrengthText()}</span>
                      </div>
                    </div>
                  )}
                  {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-4 bg-white/10 border rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${
                        errors.confirmPassword ? 'border-red-500/50' : 'border-white/20'
                      }`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                      disabled={loading}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white py-4 rounded-xl font-semibold text-lg hover:from-gray-900 hover:to-black focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Creating admin account...
                    </>
                  ) : (
                    <>
                      <FaShieldAlt className="mr-2" />
                      Create Admin Account
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-400">
                  Already have an admin account?{" "}
                  <Link
                    to="/admin-login"
                    className="text-gray-300 hover:text-white font-semibold transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
