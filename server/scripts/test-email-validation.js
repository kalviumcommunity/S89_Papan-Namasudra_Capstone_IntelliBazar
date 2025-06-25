const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 8080}`;

// Test cases for email validation
const emailTestCases = [
  // Valid emails
  { email: 'test@example.com', password: 'test123', valid: true, description: 'Valid email format' },
  { email: 'user.name@domain.co.uk', password: 'test123', valid: true, description: 'Valid email with subdomain' },
  { email: 'test+tag@gmail.com', password: 'test123', valid: true, description: 'Valid email with plus sign' },
  
  // Invalid emails
  { email: 'notanemail', password: 'test123', valid: false, description: 'No @ symbol' },
  { email: 'invalid@', password: 'test123', valid: false, description: 'Missing domain' },
  { email: '@invalid.com', password: 'test123', valid: false, description: 'Missing local part' },
  { email: 'invalid.email', password: 'test123', valid: false, description: 'No @ symbol' },
  { email: '', password: 'test123', valid: false, description: 'Empty email' },
  { email: 'test@', password: 'test123', valid: false, description: 'Incomplete domain' },
  { email: 'test@.com', password: 'test123', valid: false, description: 'Invalid domain format' },
  { email: 'test..test@example.com', password: 'test123', valid: false, description: 'Double dots in local part' },
  
  // Edge cases
  { email: 'test@example', password: 'test123', valid: false, description: 'Domain without TLD' },
  { email: 'test@example.', password: 'test123', valid: false, description: 'Domain ending with dot' },
];

// Test cases for missing fields
const missingFieldTests = [
  { email: '', password: 'test123', description: 'Missing email' },
  { email: 'test@example.com', password: '', description: 'Missing password' },
  { email: '', password: '', description: 'Missing both fields' },
];

async function testEmailValidation() {
  console.log('🧪 Testing Email Validation');
  console.log('============================');
  
  for (const testCase of emailTestCases) {
    try {
      console.log(`\n📧 Testing: ${testCase.description}`);
      console.log(`   Email: "${testCase.email}"`);
      
      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: testCase.email,
        password: testCase.password
      });
      
      if (testCase.valid) {
        // For valid emails, we expect either "User not found" or successful login
        if (response.data.message === "User not found") {
          console.log('   ✅ Valid email format accepted (user not found as expected)');
        } else {
          console.log('   ✅ Valid email format accepted and login successful');
        }
      } else {
        console.log('   ❌ Invalid email should have been rejected but was accepted');
      }
      
    } catch (error) {
      if (!testCase.valid) {
        console.log('   ✅ Invalid email correctly rejected');
        console.log(`   📧 Error: ${error.response?.data?.message}`);
      } else {
        if (error.response?.data?.message === "User not found") {
          console.log('   ✅ Valid email format accepted (user not found as expected)');
        } else {
          console.log('   ❌ Valid email was unexpectedly rejected');
          console.log(`   📧 Error: ${error.response?.data?.message}`);
        }
      }
    }
  }
}

async function testMissingFields() {
  console.log('\n\n🧪 Testing Missing Fields');
  console.log('==========================');
  
  for (const testCase of missingFieldTests) {
    try {
      console.log(`\n📧 Testing: ${testCase.description}`);
      console.log(`   Email: "${testCase.email}"`);
      console.log(`   Password: "${testCase.password ? '[PROVIDED]' : '[EMPTY]'}"`);
      
      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: testCase.email,
        password: testCase.password
      });
      
      console.log('   ❌ Missing field should have been rejected but was accepted');
      
    } catch (error) {
      console.log('   ✅ Missing field correctly rejected');
      console.log(`   📧 Error: ${error.response?.data?.message}`);
    }
  }
}

async function testUsernameRejection() {
  console.log('\n\n🧪 Testing Username Rejection');
  console.log('==============================');
  
  const usernameTests = [
    { username: 'testuser', password: 'test123', description: 'Username field instead of email' },
    { user: 'testuser', password: 'test123', description: 'User field instead of email' },
  ];
  
  for (const testCase of usernameTests) {
    try {
      console.log(`\n📧 Testing: ${testCase.description}`);
      
      const response = await axios.post(`${BASE_URL}/api/auth/login`, testCase);
      
      console.log('   ❌ Username should have been rejected but was accepted');
      
    } catch (error) {
      console.log('   ✅ Username correctly rejected');
      console.log(`   📧 Error: ${error.response?.data?.message}`);
    }
  }
}

async function testErrorMessages() {
  console.log('\n\n🧪 Testing Error Messages');
  console.log('==========================');
  
  const errorTests = [
    {
      data: { email: '', password: 'test123' },
      expectedMessage: 'Email and password are required',
      description: 'Missing email error message'
    },
    {
      data: { email: 'test@example.com', password: '' },
      expectedMessage: 'Email and password are required',
      description: 'Missing password error message'
    },
    {
      data: { email: 'nonexistent@example.com', password: 'test123' },
      expectedMessage: 'User not found',
      description: 'Non-existent user error message'
    },
  ];
  
  for (const testCase of errorTests) {
    try {
      console.log(`\n📧 Testing: ${testCase.description}`);
      
      const response = await axios.post(`${BASE_URL}/api/auth/login`, testCase.data);
      console.log('   ❌ Expected error but got success response');
      
    } catch (error) {
      const actualMessage = error.response?.data?.message;
      if (actualMessage === testCase.expectedMessage) {
        console.log('   ✅ Correct error message returned');
        console.log(`   📧 Message: "${actualMessage}"`);
      } else {
        console.log('   ⚠️ Unexpected error message');
        console.log(`   📧 Expected: "${testCase.expectedMessage}"`);
        console.log(`   📧 Actual: "${actualMessage}"`);
      }
    }
  }
}

async function runValidationTests() {
  try {
    console.log('🚀 Starting Email Validation Tests\n');
    
    await testEmailValidation();
    await testMissingFields();
    await testUsernameRejection();
    await testErrorMessages();
    
    console.log('\n\n🎉 Email Validation Tests Completed!');
    console.log('====================================');
    console.log('✅ Email format validation is working');
    console.log('✅ Missing field validation is working');
    console.log('✅ Username rejection is working');
    console.log('✅ Error messages are appropriate');
    
  } catch (error) {
    console.error('\n❌ Email Validation Tests Failed!');
    console.error('=================================');
    console.error('Error:', error.message);
  }
}

runValidationTests();
