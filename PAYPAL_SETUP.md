# PayPal Integration Setup Guide

## Overview
Your IntelliBazar application has been successfully configured to use PayPal instead of Razorpay for payment processing. PayPal is easier to set up and provides a reliable payment gateway.

## Current Configuration
The application is currently configured with PayPal sandbox (test) credentials that allow you to test the payment flow without real money transactions.

### Test Credentials (Already Configured)
- **Client ID**: `AYu97XgZ5vUagf5o8op2j7IOdgz3aLLfEO3Xu0KRZ0xl5M9KMlegnXOmLLW3H-UNsJvCibjYdMm953Xv`
- **Mode**: `sandbox` (test mode)

## How to Get Your Own PayPal Credentials (Optional)

### Step 1: Create PayPal Developer Account
1. Go to [PayPal Developer](https://developer.paypal.com/)
2. Sign in with your PayPal account or create a new one
3. Click "Create App" in the dashboard

### Step 2: Create Application
1. Choose "Default Application" 
2. Select "Sandbox" for testing
3. Choose "Merchant" as the account type
4. Click "Create App"

### Step 3: Get Your Credentials
1. After creating the app, you'll see:
   - **Client ID** (public key)
   - **Client Secret** (private key)
2. Copy these credentials

### Step 4: Update Environment Variables
Replace the values in `server/.env`:
```env
PAYPAL_CLIENT_ID=your_actual_client_id_here
PAYPAL_CLIENT_SECRET=your_actual_client_secret_here
PAYPAL_MODE=sandbox
```

### Step 5: Update Frontend Environment
Update the PayPal Client ID in `client/.env`:
```env
VITE_PAYPAL_CLIENT_ID=your_actual_client_id_here
```

Note: The PayPal SDK is loaded dynamically by the application, so no HTML changes are needed.

## Testing the Integration

### Test Payment Flow
1. Start your application
2. Add items to cart
3. Go to checkout
4. Select "PayPal" as payment method
5. Complete the order
6. You'll be redirected to PayPal's sandbox environment
7. Use PayPal's test accounts to complete payment

### PayPal Test Accounts
PayPal provides test buyer and seller accounts for testing. You can find these in your PayPal Developer dashboard under "Sandbox Accounts".

## Production Setup

### When Ready for Live Payments
1. Change `PAYPAL_MODE=live` in your `.env` file
2. Replace sandbox credentials with live credentials
3. Update the PayPal SDK URL to use live client ID
4. Test thoroughly before going live

## Features Implemented

✅ **PayPal Payment Integration**
- Secure payment processing
- Order creation and verification
- Payment status tracking
- Email confirmations

✅ **Fallback Options**
- Cash on Delivery (COD) still available
- Error handling for payment failures

✅ **Database Integration**
- Orders stored with PayPal transaction details
- Payment status tracking
- Order history

## Benefits of PayPal Integration

1. **Easy Setup**: No complex verification process
2. **Trusted Brand**: Customers trust PayPal
3. **Global Reach**: Accepts international payments
4. **Security**: PCI compliant payment processing
5. **Mobile Friendly**: Works well on mobile devices

## Troubleshooting

### "PayPal SDK not loaded" Error
This error has been fixed by implementing dynamic SDK loading. The application now:
1. Loads PayPal SDK dynamically when needed
2. Shows a loading message while PayPal initializes
3. Creates a modal overlay for the payment process

### Other Common Issues
1. **Payment not processing**: Check browser console for errors
2. **Invalid credentials**: Verify Client ID matches in both server and client `.env` files
3. **CORS errors**: Ensure your domain is added to PayPal app settings
4. **Currency issues**: Currently set to USD, can be changed in the SDK URL

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify PayPal SDK loads dynamically
3. Ensure credentials match in both `.env` files
4. Test with PayPal's sandbox accounts

The current test setup should work immediately without any additional configuration!
