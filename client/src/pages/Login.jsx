import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaGoogle, FaShoppingCart, FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // ✅ Import useAuth

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth(); // ✅ Get setUser from AuthContext

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Check for success message from signup
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/api/auth/google";
  };

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

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", formData, {
        withCredentials: true,
      });

      // ✅ Save token in localStorage
      localStorage.setItem("token", res.data.token);

      // ✅ Fetch the user and set in context
      const userRes = await axios.get("http://localhost:8080/api/auth/me", {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${res.data.token}`, // if your backend uses token header
        },
      });

      setUser(userRes.data); // ✅ Set the logged-in user in context

      navigate("/"); // ✅ Redirect to homepage
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left: Image Section */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-12 items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 text-center text-white">
              <FaShoppingCart className="text-6xl mb-6 mx-auto opacity-90" />
              <h3 className="text-4xl font-bold mb-4">Welcome Back!</h3>
              <p className="text-xl opacity-90 leading-relaxed">
                Sign in to continue your shopping journey with IntelliBazar
              </p>
              <div className="mt-8 flex justify-center space-x-2">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          </div>

          {/* Right: Login Form */}
          <div className="w-full lg:w-1/2 p-8 lg:p-12">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <FaShoppingCart className="text-4xl text-blue-600 mr-3" />
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    IntelliBazar
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Welcome back!</h2>
                <p className="text-gray-300">Please login to your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {successMessage && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <p className="text-green-400 text-sm">{successMessage}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Password"
                      className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm pr-12"
                      required
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
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center text-sm text-gray-300">
                    <input type="checkbox" className="mr-2 rounded" />
                    Remember me
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gray-900 text-gray-300">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                  >
                    <FaGoogle className="text-red-500 text-xl mr-2" />
                    Continue with Google
                  </button>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-300">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                  >
                    Sign up
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

export default Login;
