const nodemailer = require('nodemailer');

// Simple Gmail transporter
const createGmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send password reset email - Simple method
const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    console.log(`Sending password reset email to: ${email}`);

    const transporter = createGmailTransporter();
    
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    // Simple email content
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset - IntelliBazar',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6;">🛍️ IntelliBazar</h1>
            <h2 style="color: #333;">Password Reset Request</h2>
          </div>

          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p>Hello,</p>
            <p>We received a request to reset your password for your IntelliBazar account.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}"
                 style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Your Password
              </a>
            </div>

            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #3b82f6;">${resetUrl}</p>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <strong>⚠️ Important:</strong>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>
          </div>

          <div style="text-align: center; color: #666; font-size: 14px;">
            <p>© 2024 IntelliBazar. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `
        IntelliBazar - Password Reset Request

        Hello,

        We received a request to reset your password for your IntelliBazar account.

        To reset your password, please visit: ${resetUrl}

        This link will expire in 1 hour for security reasons.

        If you didn't request this password reset, please ignore this email.

        Best regards,
        The IntelliBazar Team
      `
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Password reset email sent successfully!');
    console.log('📨 Message ID:', info.messageId);
    console.log('📧 Email sent from:', mailOptions.from);
    console.log('📧 Email sent to:', mailOptions.to);
    console.log('📧 Subject:', mailOptions.subject);
    console.log('🔗 Reset URL:', resetUrl);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error.message);
    return { success: false, error: error.message };
  }
};

// Simple test function
const testEmailConfig = async () => {
  try {
    console.log('🧪 Testing Gmail connection...');
    const transporter = createGmailTransporter();
    await transporter.verify();
    console.log('✅ Gmail connection successful!');
    return { success: true, message: 'Gmail connection successful' };
  } catch (error) {
    console.error('❌ Gmail connection failed:', error.message);
    return { success: false, message: error.message };
  }
};

module.exports = {
  sendPasswordResetEmail,
  testEmailConfig
};
