const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const path = require("path");

dotenv.config();

// Initialize Express
const app = express();

// Passport config
require("./config/passport");

// Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// CORS configuration to allow multiple origins
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.CLIENT_URL,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000'
    ];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
console.log('🔧 Loading auth routes...');
app.use("/api/auth", require("./routes/authRoutes"));
console.log('✅ Auth routes loaded');

console.log('🔧 Loading admin auth routes...');
const adminAuthRoutes = require("./routes/adminAuthRoutes");
console.log('🔍 Admin auth routes type:', typeof adminAuthRoutes);
console.log('🔍 Admin auth routes keys:', Object.keys(adminAuthRoutes || {}));
app.use("/api/seller", adminAuthRoutes);
console.log('✅ Admin auth routes loaded');

console.log('🔧 Loading product routes...');
app.use("/api/products", require("./routes/productRoutes"));
console.log('✅ Product routes loaded');

console.log('🔧 Loading cart routes...');
app.use("/api/cart", require("./routes/cartRoutes"));
console.log('✅ Cart routes loaded');

console.log('🔧 Loading wishlist routes...');
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
console.log('✅ Wishlist routes loaded');

console.log('🔧 Loading order routes...');
app.use("/api/orders", require("./routes/orderRoutes"));
console.log('✅ Order routes loaded');

console.log('🔧 Loading video routes...');
app.use("/api/videos", require("./routes/videoRoutes"));
console.log('✅ Video routes loaded');

console.log('🔧 Loading address routes...');
app.use("/api/addresses", require("./routes/addressRoutes"));
console.log('✅ Address routes loaded');

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running");
});





// Connect DB and Start Server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${process.env.PORT}`);
      console.log(`Backend accessible at: http://localhost:${process.env.PORT}`);
      console.log(`Backend accessible at: http://127.0.0.1:${process.env.PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
