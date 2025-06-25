const { testEmailConfig, sendPasswordResetEmail } = require('../utils/emailService');
require('dotenv').config();

async function testEmail() {
  console.log('🧪 Testing Gmail email setup...\n');

  // Test 1: Gmail connection
  console.log('1. Testing Gmail connection...');
  const configTest = await testEmailConfig();

  if (configTest.success) {
    console.log('✅ Gmail connection successful!');
  } else {
    console.log('❌ Gmail connection failed:', configTest.message);
    console.log('\n💡 Make sure you have:');
    console.log('   - Enabled 2FA on your Gmail account');
    console.log('   - Generated an App Password');
    console.log('   - Set EMAIL_USER and EMAIL_PASS in .env file');
    return;
  }

  // Test 2: Send a test email
  console.log('\n2. Sending test password reset email...');

  const testEmailAddress = process.env.EMAIL_USER;
  const testToken = 'test-token-' + Date.now();

  try {
    const result = await sendPasswordResetEmail(testEmailAddress, testToken);

    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log('📧 Check your Gmail inbox for the password reset email');
      console.log('📨 Message ID:', result.messageId);
    } else {
      console.log('❌ Failed to send test email:', result.error);
    }
  } catch (error) {
    console.log('❌ Error sending test email:', error.message);
  }

  console.log('\n📋 Current configuration:');
  console.log('   EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
  console.log('   EMAIL_USER:', process.env.EMAIL_USER);
  console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? '***set***' : 'Not set');
  console.log('   EMAIL_FROM:', process.env.EMAIL_FROM);
}

// Run the test
testEmail().catch(console.error);
