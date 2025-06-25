// PayPal configuration
let paypalConfig = null;

try {
    if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
        const environment = process.env.PAYPAL_MODE === 'live' ? 'live' : 'sandbox';

        paypalConfig = {
            clientId: process.env.PAYPAL_CLIENT_ID,
            clientSecret: process.env.PAYPAL_CLIENT_SECRET,
            environment: environment,
        };

        console.log(`✅ PayPal configured successfully in ${environment} mode`);
    } else {
        console.log("⚠️ PayPal credentials not configured - payment features will be limited");
    }
} catch (error) {
    console.error("❌ Error configuring PayPal:", error);
}

module.exports = paypalConfig;
