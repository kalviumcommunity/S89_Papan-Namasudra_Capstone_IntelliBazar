import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaShieldAlt, FaEye, FaEyeSlash, FaSpinner, FaEnvelope, FaLock } from "react-icons/fa";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Check for success message from registration
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate email format
    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!formData.password) {
      setError("Password is required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/seller/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store admin token and user data
        localStorage.setItem("adminToken", data.adminToken);
        localStorage.setItem("adminUser", JSON.stringify(data.adminUser));
        
        // Redirect to admin dashboard
        navigate("/admin");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left: Admin Info Section */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-800 to-gray-900 p-12 items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 text-center text-white">
              <FaShieldAlt className="text-6xl mb-6 mx-auto opacity-90" />
              <h3 className="text-4xl font-bold mb-4">Admin Portal</h3>
              <p className="text-xl opacity-90 leading-relaxed mb-6">
                Access your IntelliBazar admin dashboard to manage products, orders, and analytics.
              </p>
              <div className="space-y-3 text-left">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span>Secure Admin Access</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span>Real-time Analytics</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span>Product Management</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span>Order Processing</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Login Form */}
          <div className="w-full lg:w-1/2 p-8 lg:p-12">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <FaShieldAlt className="text-4xl text-gray-400 mr-3" />
                  <span className="text-3xl font-bold bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
                    Admin Portal
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Welcome back!</h2>
                <p className="text-gray-300">Please sign in to your admin account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {successMessage && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <p className="text-green-400 text-sm">{successMessage}</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Email */}
                  <div>
                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your admin email"
                        className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="relative">
                      <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Password"
                        className="w-full pl-12 pr-16 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                        required
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
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white py-4 rounded-xl font-semibold text-lg hover:from-gray-900 hover:to-black focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <FaShieldAlt className="mr-2" />
                      Sign In to Admin Portal
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center space-y-4">
                <p className="text-gray-400">
                  Don't have an admin account?{" "}
                  <Link
                    to="/admin-register"
                    className="text-gray-300 hover:text-white font-semibold transition-colors"
                  >
                    Register here
                  </Link>
                </p>
                
                <div className="border-t border-white/10 pt-4">
                  <p className="text-gray-500 text-sm">
                    Need help? Contact support at{" "}
                    <a 
                      href="mailto:admin-support@intellibazar.com" 
                      className="text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      admin-support@intellibazar.com
                    </a>
                  </p>
                </div>

                <div className="pt-4">
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
                  >
                    ← Back to IntelliBazar
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
