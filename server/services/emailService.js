const nodemailer = require("nodemailer");

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        service: process.env.EMAIL_SERVICE || "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Generate order confirmation email HTML
const generateOrderConfirmationHTML = (order) => {
    const { customerInfo, products, pricing, tracking, payment } = order;
    
    const productRows = products.map(product => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <img src="${product.productImage}" alt="${product.productName}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px; margin-right: 10px; vertical-align: middle;">
                <span style="vertical-align: middle;">${product.productName}</span>
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${product.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${typeof product.productPrice === 'string' ? product.productPrice.replace(/[^\d]/g, '') : product.productPrice}</td>
        </tr>
    `).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - IntelliBazar</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Order Confirmed!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for shopping with IntelliBazar</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
            <div style="margin-bottom: 30px;">
                <h2 style="color: #333; margin-bottom: 15px;">Hello ${customerInfo.firstName},</h2>
                <p>Your order has been confirmed and is being processed. Here are your order details:</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <h3 style="margin-top: 0; color: #495057;">Order Information</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Order Number:</td>
                        <td style="padding: 8px 0;">${tracking.orderNumber}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Order Date:</td>
                        <td style="padding: 8px 0;">${new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Payment Method:</td>
                        <td style="padding: 8px 0;">${payment.method.toUpperCase()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Payment Status:</td>
                        <td style="padding: 8px 0; color: ${payment.status === 'completed' ? '#28a745' : '#ffc107'};">
                            ${payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </td>
                    </tr>
                </table>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h3 style="color: #333; margin-bottom: 15px;">Order Items</h3>
                <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Product</th>
                            <th style="padding: 12px; text-align: center; border-bottom: 1px solid #ddd;">Quantity</th>
                            <th style="padding: 12px; text-align: right; border-bottom: 1px solid #ddd;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productRows}
                    </tbody>
                </table>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <h3 style="margin-top: 0; color: #495057;">Order Summary</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 5px 0;">Subtotal:</td>
                        <td style="padding: 5px 0; text-align: right;">₹${pricing.subtotal}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0;">Shipping:</td>
                        <td style="padding: 5px 0; text-align: right;">${pricing.shipping === 0 ? 'Free' : '₹' + pricing.shipping}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0;">Tax (GST):</td>
                        <td style="padding: 5px 0; text-align: right;">₹${pricing.tax}</td>
                    </tr>
                    ${pricing.discount > 0 ? `
                    <tr style="color: #28a745;">
                        <td style="padding: 5px 0;">Discount${pricing.couponCode ? ` (${pricing.couponCode})` : ''}:</td>
                        <td style="padding: 5px 0; text-align: right;">-₹${pricing.discount}</td>
                    </tr>
                    ` : ''}
                    <tr style="border-top: 2px solid #333; font-weight: bold; font-size: 18px;">
                        <td style="padding: 10px 0;">Total:</td>
                        <td style="padding: 10px 0; text-align: right;">₹${pricing.totalAmount}</td>
                    </tr>
                </table>
            </div>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <h3 style="margin-top: 0; color: #1976d2;">Shipping Information</h3>
                <p style="margin: 0;">
                    <strong>${customerInfo.firstName} ${customerInfo.lastName}</strong><br>
                    ${order.shippingAddress.address}<br>
                    ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}<br>
                    ${order.shippingAddress.country}<br>
                    Phone: ${customerInfo.phone}
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <p style="color: #666; margin-bottom: 20px;">
                    Estimated delivery: 3-5 business days<br>
                    You will receive a tracking number once your order is shipped.
                </p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 14px; margin: 0;">
                        Thank you for choosing IntelliBazar!<br>
                        For any questions, contact us at <a href="mailto:support@intellibazar.com" style="color: #667eea;">support@intellibazar.com</a>
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (order) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || "IntelliBazar <noreply@intellibazar.com>",
            to: order.customerInfo.email,
            subject: `Order Confirmation - ${order.tracking.orderNumber}`,
            html: generateOrderConfirmationHTML(order)
        };

        const result = await transporter.sendMail(mailOptions);
        console.log("✅ Order confirmation email sent:", result.messageId);
        return { success: true, messageId: result.messageId };
        
    } catch (error) {
        console.error("❌ Error sending order confirmation email:", error);
        return { success: false, error: error.message };
    }
};

// Send order status update email
const sendOrderStatusUpdateEmail = async (order, newStatus) => {
    try {
        const transporter = createTransporter();
        
        const statusMessages = {
            confirmed: "Your order has been confirmed and is being processed.",
            processing: "Your order is currently being processed.",
            shipped: "Great news! Your order has been shipped.",
            delivered: "Your order has been delivered successfully.",
            cancelled: "Your order has been cancelled."
        };

        const mailOptions = {
            from: process.env.EMAIL_FROM || "IntelliBazar <noreply@intellibazar.com>",
            to: order.customerInfo.email,
            subject: `Order Update - ${order.tracking.orderNumber}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>Order Status Update</h2>
                    <p>Hello ${order.customerInfo.firstName},</p>
                    <p>${statusMessages[newStatus] || "Your order status has been updated."}</p>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <strong>Order Number:</strong> ${order.tracking.orderNumber}<br>
                        <strong>Status:</strong> ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}
                    </div>
                    <p>Thank you for shopping with IntelliBazar!</p>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log("✅ Order status update email sent:", result.messageId);
        return { success: true, messageId: result.messageId };
        
    } catch (error) {
        console.error("❌ Error sending order status update email:", error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendOrderConfirmationEmail,
    sendOrderStatusUpdateEmail
};
