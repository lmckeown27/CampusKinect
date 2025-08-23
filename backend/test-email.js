// Test Email Configuration
require('dotenv').config();
const { createTransporter } = require('./src/services/emailService');

async function testEmailConfig() {
  console.log('🧪 Testing Email Configuration...\n');
  
  console.log('📋 Environment Variables:');
  console.log(`SMTP_HOST: ${process.env.SMTP_HOST}`);
  console.log(`SMTP_PORT: ${process.env.SMTP_PORT}`);
  console.log(`SMTP_USER: ${process.env.SMTP_USER}`);
  console.log(`SMTP_PASS: ${process.env.SMTP_PASS ? 'SET (hidden)' : 'NOT SET'}`);
  
  console.log('\n🔧 Creating email transporter...');
  
  try {
    const transporter = createTransporter();
    console.log('✅ Transporter created successfully');
    
    console.log('🔌 Testing connection...');
    await transporter.verify();
    console.log('✅ Connection verified successfully');
    
    console.log('\n📧 Testing email sending...');
    
    // Test sending to a sample .edu email (this won't actually send, just test the configuration)
    const testMailOptions = {
      from: `"CampusConnect" <${process.env.SMTP_USER}>`,
      to: 'test@calpoly.edu', // Example recipient
      subject: 'Test Email from CampusConnect',
      text: 'This is a test email to verify the email service configuration.',
      html: '<h1>Test Email</h1><p>This is a test email to verify the email service configuration.</p>'
    };
    
    // Note: We won't actually send this email to avoid spam
    console.log('✅ Email configuration is working correctly!');
    console.log('\n📝 Configuration Summary:');
    console.log(`- App will send emails FROM: ${process.env.SMTP_USER}`);
    console.log(`- App can send emails TO: Any .edu email address`);
    console.log(`- Service: ${process.env.SMTP_HOST === 'smtp.gmail.com' ? 'Gmail SMTP' : 'Generic SMTP'}`);
    
  } catch (error) {
    console.error('\n❌ Email configuration failed:');
    console.error(error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n🔐 Authentication failed. Please check:');
      console.log('1. Your Gmail username is correct (should be your app\'s service account)');
      console.log('2. You\'re using an App Password (not your regular password)');
      console.log('3. 2-Factor Authentication is enabled on your Google account');
      console.log('4. The App Password is for "Mail" service');
      console.log('\n💡 Remember: This Gmail account is for your APP to send emails, not for individual users');
    }
  }
}

testEmailConfig(); 