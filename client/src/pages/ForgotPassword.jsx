import { useState } from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaSpinner, FaEnvelope, FaArrowLeft, FaCheck } from "react-icons/fa";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Email address is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setIsSuccess(true);
        setMessage("Password reset instructions have been sent to your email address. Please check your inbox and follow the instructions to reset your password.");
      } else {
        setError(data.message || "Failed to send reset email. Please try again.");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

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
                <h2 className="text-3xl font-bold text-white mb-2">Forgot Password?</h2>
                <p className="text-gray-300">
                  No worries! Enter your email address and we'll send you instructions to reset your password.
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheck className="text-2xl text-green-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Check Your Email</h2>
                <p className="text-gray-300">
                  We've sent password reset instructions to your email address.
                </p>
              </>
            )}
          </div>

          {!isSuccess ? (
            <>
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${
                        error ? 'border-red-500/50' : 'border-white/20'
                      }`}
                      disabled={loading}
                      required
                    />
                  </div>
                  {error && (
                    <div className="mt-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Sending instructions...
                    </>
                  ) : (
                    "Send Reset Instructions"
                  )}
                </button>
              </form>

              {/* Back to Login */}
              <div className="mt-8 text-center">
                <Link 
                  to="/login" 
                  className="inline-flex items-center text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  <FaArrowLeft className="mr-2" />
                  Back to Login
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Success Message */}
              {message && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
                  <p className="text-green-400 text-sm leading-relaxed">{message}</p>
                </div>
              )}

              {/* Instructions */}
              <div className="space-y-4 mb-8">
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2">What's next?</h3>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">1.</span>
                      Check your email inbox (and spam folder)
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">2.</span>
                      Click the reset link in the email
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">3.</span>
                      Create a new password
                    </li>
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail("");
                    setMessage("");
                  }}
                  className="w-full bg-white/10 border border-white/20 text-white py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  Send to Different Email
                </button>
                
                <Link 
                  to="/login" 
                  className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
