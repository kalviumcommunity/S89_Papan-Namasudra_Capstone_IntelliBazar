import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import PasswordReset from "./pages/PasswordReset";
import Profile from "./pages/Profile";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext"; // ✅ import CartProvider
import { CartSidebarProvider } from "./context/CartSidebarContext"; // ✅ import CartSidebarProvider
import { WishlistProvider } from "./context/WishlistContext"; // ✅ import WishlistProvider
import { WishlistSidebarProvider } from "./context/WishlistSidebarContext"; // ✅ import WishlistSidebarProvider
import { ToastProvider } from "./context/ToastContext"; // ✅ import ToastProvider
import Home from "./pages/Home";
import Shop from "./pages/Shop"; // ✅ import Shop
import Cart from "./pages/Cart"; // ✅ import Cart
import Collections from "./pages/collections";
import Chat from "./pages/Chat"; // ✅ import Chat
import About from "./pages/About"; // ✅ import About
import Fashion from "./pages/Fashion"; // ✅ import Fashion
import NewArrivals from "./pages/NewArrivals"; // ✅ import NewArrivals
import SpecialOffers from "./pages/SpecialOffers"; // ✅ import SpecialOffers
import Electronics from "./pages/Electronics"; // ✅ import Electronics
import Watches from "./pages/Watches"; // ✅ import Watches
import Footwear from "./pages/Footwear"; // ✅ import Footwear
import HomeDecor from "./pages/HomeDecor"; // ✅ import HomeDecor
import Books from "./pages/Books"; // ✅ import Books
import Kitchen from "./pages/Kitchen"; // ✅ import Kitchen
import Sports from "./pages/Sports"; // ✅ import Sports
import Checkout from "./pages/Checkout"; // ✅ import Checkout
import Wishlist from "./pages/Wishlist"; // ✅ import Wishlist
import WishlistSidebar from "./components/WishlistSidebar"; // ✅ import WishlistSidebar
import CartSidebar from "./components/CartSidebar"; // ✅ import CartSidebar
import ToastContainer from "./components/Toast"; // ✅ import ToastContainer
import VoiceTest from "./pages/VoiceTest"; // ✅ import VoiceTest for testing
import Shorts from "./pages/Shorts"; // ✅ import Shorts
import OrderHistory from "./pages/OrderHistory"; // ✅ import OrderHistory
import AdminDashboard from "./pages/AdminDashboard"; // ✅ import AdminDashboard
import AdminLogin from "./pages/AdminLogin"; // ✅ import AdminLogin
import AdminRegister from "./pages/AdminRegister"; // ✅ import AdminRegister

import "./App.css";

// Layout component to conditionally render Header
const Layout = ({ children }) => {
  const location = useLocation();
  const isFullScreenPage = location.pathname === '/chat' || location.pathname === '/Chat' || location.pathname === '/collections' || location.pathname === '/Shorts' || location.pathname === '/admin' || location.pathname === '/admin-login' || location.pathname === '/admin-register';

  return (
    <>
      {!isFullScreenPage && <Header />}
      {children}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider> {/* ✅ Wrap entire app inside ToastProvider */}
        <CartProvider> {/* ✅ Wrap entire app inside CartProvider */}
          <CartSidebarProvider> {/* ✅ Wrap entire app inside CartSidebarProvider */}
            <WishlistProvider> {/* ✅ Wrap entire app inside WishlistProvider */}
              <WishlistSidebarProvider> {/* ✅ Wrap entire app inside WishlistSidebarProvider */}
                <Router>
                  <Layout>
                    <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/collections" element={<Collections />} />
                    <Route path="/fashion" element={<Fashion />} />
                    <Route path="/electronics" element={<Electronics />} />
                    <Route path="/watches" element={<Watches />} />
                    <Route path="/footwear" element={<Footwear />} />
                    <Route path="/home-decor" element={<HomeDecor />} />
                    <Route path="/books" element={<Books />} />
                    <Route path="/kitchen" element={<Kitchen />} />
                    <Route path="/sports" element={<Sports />} />
                    <Route path="/new-arrivals" element={<NewArrivals />} />
                    <Route path="/special-offers" element={<SpecialOffers />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<h2>Contact Page</h2>} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<PasswordReset />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/orders" element={<OrderHistory />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/voice-test" element={<VoiceTest />} />
                    <Route path="/Shorts" element={<Shorts />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin-login" element={<AdminLogin />} />
                    <Route path="/admin-register" element={<AdminRegister />} />
                    </Routes>
                    <WishlistSidebar />
                    <CartSidebar />
                    <ToastContainer />
                  </Layout>
                </Router>
              </WishlistSidebarProvider>
            </WishlistProvider>
          </CartSidebarProvider>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
