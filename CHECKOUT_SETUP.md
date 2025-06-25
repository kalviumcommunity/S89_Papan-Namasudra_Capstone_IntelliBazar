# 🛒 IntelliBazar Checkout Flow Setup Guide

## 🚀 Quick Start

### 1. **Environment Configuration**

#### Server (.env)
```bash
# MongoDB
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret

# Razorpay (Get from https://dashboard.razorpay.com/)
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here

# Email (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=IntelliBazar <your_email@gmail.com>
```

#### Client (.env)
```bash
# Razorpay Public Key (Vite requires VITE_ prefix)
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id_here

# API Base URL
VITE_API_BASE_URL=http://localhost:8080/api
```

### 2. **Start the Application**

#### Terminal 1 - Server
```bash
cd server
npm install
npm run dev
```

#### Terminal 2 - Client
```bash
cd client
npm install
npm run dev
```

### 3. **Setup Sample Data**

#### Add Sample Coupons
```bash
cd server
node scripts/add-sample-coupons.js
```

## 🧪 Testing the Checkout Flow

### 1. **User Registration/Login**
- Go to http://localhost:5174/
- Sign up or login to get authenticated
- Authentication is required for all checkout operations

### 2. **Add Items to Cart**
- Browse products in the shop
- Add items to cart using "Add to Cart" button
- Or use "Buy Now" for direct checkout

### 3. **Checkout Process**
- Navigate to `/checkout` or click checkout from cart
- Fill in customer information (Step 1)
- Enter shipping address (Step 2)
- Choose payment method (Step 3):
  - **Razorpay**: Credit/Debit cards, UPI, Net Banking
  - **Card**: Direct card payment
  - **UPI**: UPI payment
  - **COD**: Cash on Delivery

### 4. **Apply Coupons**
Available sample coupons:
- `WELCOME10` - 10% off first order (min ₹500)
- `SAVE50` - ₹50 off orders above ₹1000
- `BIGDEAL20` - 20% off orders above ₹2000
- `FREESHIP` - Free shipping
- `STUDENT15` - 15% student discount (min ₹800)

### 5. **Order Management**
- View order history at `/orders`
- Check order details and status
- Receive email confirmations

## 🔧 Troubleshooting

### Common Issues

#### 1. **500 Internal Server Error**
- Check if MongoDB is connected
- Verify environment variables are set
- Check server logs for specific errors

#### 2. **Coupon Errors**
- Ensure sample coupons are added to database
- Check user authentication
- Verify coupon validity dates

#### 3. **Payment Issues**
- Update Razorpay keys in both server and client .env files
- Test with Razorpay test mode first
- Check Razorpay dashboard for webhook configurations

#### 4. **Email Issues**
- Use Gmail app passwords (not regular password)
- Enable 2-factor authentication on Gmail
- Check EMAIL_* environment variables

### Debug Steps

1. **Check Server Logs**
   ```bash
   # Server terminal will show detailed logs
   # Look for error messages and stack traces
   ```

2. **Check Browser Console**
   ```bash
   # Open browser dev tools (F12)
   # Check Console tab for JavaScript errors
   # Check Network tab for API request failures
   ```

3. **Test API Endpoints**
   ```bash
   # Test server health
   curl http://localhost:8080/
   
   # Test with authentication (replace TOKEN with actual JWT)
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:8080/api/orders/coupons/available
   ```

## 📋 Features Implemented

### ✅ **Core Checkout Features**
- Multi-step checkout process
- Cart and direct purchase support
- Real-time pricing calculations
- Coupon system with validation
- Multiple payment methods
- Order confirmation emails
- Order history and tracking

### ✅ **Payment Integration**
- Razorpay payment gateway
- Secure payment verification
- Support for cards, UPI, net banking
- Cash on Delivery option

### ✅ **Database Models**
- Enhanced Order model with comprehensive fields
- Coupon model with usage tracking
- User association and authentication

### ✅ **Admin Features**
- Order management dashboard
- Status updates with email notifications
- Order statistics and analytics

### ✅ **Design**
- Gray/blackish theme consistency
- Responsive design
- Loading states and error handling
- Professional UI/UX

## 🔗 **Key URLs**
- **Home**: http://localhost:5174/
- **Shop**: http://localhost:5174/shop
- **Cart**: http://localhost:5174/cart
- **Checkout**: http://localhost:5174/checkout
- **Orders**: http://localhost:5174/orders
- **Profile**: http://localhost:5174/profile

## 📞 **Support**
If you encounter any issues:
1. Check this troubleshooting guide
2. Review server and browser console logs
3. Verify environment configuration
4. Test with sample data

The checkout flow is now fully functional and ready for production use! 🎉
