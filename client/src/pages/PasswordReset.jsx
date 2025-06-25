import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaShoppingCart, FaSpinner, FaEye, FaEyeSlash, FaCheck, FaExclamationTriangle } from "react-icons/fa";

const PasswordReset = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);

  useEffect(() => {
    // Verify token on component mount
    if (!token) {
      setTokenValid(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/auth/verify-reset-token?token=${token}`);
        setTokenValid(response.ok);
      } catch (error) {
        console.error("Token verification error:", error);
        setTokenValid(false);
      }
    };

    verifyToken();
  }, [token]);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength <= 2) return "bg-yellow-500";
    if (passwordStrength <= 3) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return "Weak";
    if (passwordStrength <= 2) return "Fair";
    if (passwordStrength <= 3) return "Good";
    return "Strong";
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

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      const response = await fetch("http://localhost:8080/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setIsSuccess(true);
      } else {
        setErrors({ general: data.message || "Failed to reset password. Please try again." });
      }
    } catch (error) {
      console.error("Password reset error:", error);
      setErrors({ general: "Network error. Please check your connection and try again." });
    } finally {
      setLoading(false);
    }
  };

  // Show loading while verifying token
  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="text-center text-white">
          <FaSpinner className="animate-spin text-4xl mb-4 mx-auto" />
          <p>Verifying reset token...</p>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8 lg:p-12 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaExclamationTriangle className="text-2xl text-red-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Invalid Reset Link</h2>
            <p className="text-gray-300 mb-8">
              This password reset link is invalid or has expired. Please request a new password reset.
            </p>
            <div className="space-y-4">
              <Link 
                to="/forgot-password" 
                className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                Request New Reset Link
              </Link>
              <Link 
                to="/login" 
                className="block w-full bg-white/10 border border-white/20 text-white py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="p-8 lg:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <FaShoppingCart className="text-4xl text-blue-600 mr-3" />
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                IntelliBazar
              </span>
            </div>
            
            {!isSuccess ? (
              <>
                <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
                <p className="text-gray-300">
                  Enter your new password below to complete the reset process.
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheck className="text-2xl text-green-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Password Reset Complete</h2>
                <p className="text-gray-300">
                  Your password has been successfully reset. You can now log in with your new password.
                </p>
              </>
            )}
          </div>

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-400 text-sm">{errors.general}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="New password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-4 bg-white/10 border rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm pr-12 ${
                        errors.password ? 'border-red-500/50' : 'border-white/20'
                      }`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                      disabled={loading}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">Password strength:</span>
                        <span className={`font-medium ${
                          passwordStrength <= 1 ? 'text-red-400' :
                          passwordStrength <= 2 ? 'text-yellow-400' :
                          passwordStrength <= 3 ? 'text-blue-400' : 'text-green-400'
                        }`}>
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-4 bg-white/10 border rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm pr-12 ${
                        errors.confirmPassword ? 'border-red-500/50' : 'border-white/20'
                      }`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                      disabled={loading}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Resetting password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <Link 
                to="/login" 
                className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                Continue to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;
