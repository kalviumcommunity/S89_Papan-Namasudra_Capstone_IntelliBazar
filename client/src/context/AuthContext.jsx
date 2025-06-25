import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Check if there's a token in the URL (from Google OAuth redirect)
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        const error = urlParams.get('error');

        // Handle OAuth errors
        if (error) {
          console.error('OAuth error:', error);
          let errorMessage = 'Authentication failed';
          switch (error) {
            case 'oauth_failed':
              errorMessage = 'Google authentication failed. Please try again.';
              break;
            case 'no_user':
              errorMessage = 'Unable to retrieve user information. Please try again.';
              break;
            case 'callback_error':
              errorMessage = 'Authentication callback error. Please try again.';
              break;
          }
          // You can show this error to the user via a toast or alert
          console.error(errorMessage);
          window.history.replaceState({}, document.title, window.location.pathname);
          setLoading(false);
          return;
        }

        if (urlToken) {
          console.log('🔑 Token received from OAuth redirect');
          // Store the token from URL and clean up the URL
          localStorage.setItem("token", urlToken);
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        const token = localStorage.getItem("token");

        if (token) {
          const res = await axios.get("http://localhost:8080/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true, // For Google login
          });

          setUser(res.data);
          console.log('✅ User authenticated successfully');
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('❌ Authentication error:', err);
        // Clear invalid token
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    console.log('🔓 User logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
