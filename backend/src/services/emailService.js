// Email Service for CampusConnect
// This service sends emails FROM the app TO users with .edu email addresses
// The Gmail SMTP account is the app's service account, not individual user accounts

const nodemailer = require('nodemailer');

// Create email transporter based on environment configuration
const createTransporter = () => {
  // Debug environment variables
  console.log('🔧 EMAIL DEBUG: Environment variables check:');
  console.log('🔧 SMTP_HOST:', process.env.SMTP_HOST);
  console.log('🔧 SMTP_PORT:', process.env.SMTP_PORT);
  console.log('🔧 SMTP_USER:', process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 5) + '***' : 'NOT SET');
  console.log('🔧 SMTP_PASS:', process.env.SMTP_PASS ? '***SET***' : 'NOT SET');
  
  // For Gmail, we need a service account with App Password
  if (process.env.SMTP_HOST === 'smtp.gmail.com') {
    console.log('✅ EMAIL DEBUG: Using Gmail configuration');
    return nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // TLS
      auth: { 
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_PASS 
      },
      tls: { rejectUnauthorized: false }
    });
  }
  
  // Generic SMTP configuration for other providers
  console.log('⚠️  EMAIL DEBUG: Using generic SMTP configuration (not Gmail)');
  
  // PRODUCTION FIX: If SMTP_HOST is localhost/127.0.0.1, force Gmail config
  if (process.env.SMTP_HOST === '127.0.0.1' || process.env.SMTP_HOST === 'localhost') {
    console.log('🚨 EMAIL DEBUG: Detected localhost SMTP_HOST, forcing Gmail configuration');
    return nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // TLS
      auth: { 
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_PASS 
      },
      tls: { rejectUnauthorized: false }
    });
  }
  
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Send verification email
const sendVerificationEmail = async (email, firstName, token) => {
  try {
    console.log('📧 Attempting to send verification email to:', email);
    
    const transporter = createTransporter();
    console.log('✅ Email transporter created successfully');
    
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: `"CampusConnect" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify Your CampusConnect Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">CampusConnect</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your University Bulletin Board</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${firstName}!</h2>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 25px;">
              Welcome to CampusConnect! We're excited to have you join our community of students 
              connecting through offers, requests, and events.
            </p>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 25px;">
              To get started, please verify your email address by clicking the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            
            <p style="color: #667eea; font-size: 14px; word-break: break-all; margin-bottom: 25px;">
              ${verificationUrl}
            </p>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              This verification link will expire in 24 hours. If you need a new one, 
              you can request it from the login page.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
              If you didn't create a CampusConnect account, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
      text: `
        Welcome to CampusConnect!
        
        Hi ${firstName},
        
        Welcome to CampusConnect! We're excited to have you join our community of students 
        connecting through offers, requests, and events.
        
        To get started, please verify your email address by visiting:
        ${verificationUrl}
        
        This verification link will expire in 24 hours.
        
        If you didn't create a CampusConnect account, you can safely ignore this email.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📧 To:', email);
    return true;

  } catch (error) {
    console.error('❌ Failed to send verification email:');
    console.error('📧 Email:', email);
    console.error('📧 Error:', error.message);
    if (error.code) console.error('📧 Error Code:', error.code);
    if (error.response) console.error('📧 SMTP Response:', error.response);
    return false;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, firstName, token) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: `"CampusConnect" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset Your CampusConnect Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">CampusConnect</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Password Reset Request</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${firstName}!</h2>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 25px;">
              We received a request to reset your CampusConnect password. 
              If you didn't make this request, you can safely ignore this email.
            </p>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 25px;">
              To reset your password, click the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            
            <p style="color: #667eea; font-size: 14px; word-break: break-all; margin-bottom: 25px;">
              ${resetUrl}
            </p>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              This reset link will expire in 1 hour. If you need a new one, 
              you can request it from the login page.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
              If you didn't request a password reset, please contact support immediately.
            </p>
          </div>
        </div>
      `,
      text: `
        Password Reset Request - CampusConnect
        
        Hi ${firstName},
        
        We received a request to reset your CampusConnect password. 
        If you didn't make this request, you can safely ignore this email.
        
        To reset your password, visit:
        ${resetUrl}
        
        This reset link will expire in 1 hour.
        
        If you didn't request a password reset, please contact support immediately.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    return true;

  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    return false;
  }
};

// Send notification email
const sendNotificationEmail = async (email, firstName, subject, message, actionUrl = null, actionText = null) => {
  try {
    const transporter = createTransporter();
    
    let actionButton = '';
    if (actionUrl && actionText) {
      actionButton = `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${actionUrl}" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 25px; 
                    display: inline-block; 
                    font-weight: bold;
                    font-size: 16px;">
            ${actionText}
          </a>
        </div>
      `;
    }
    
    const mailOptions = {
      from: `"CampusConnect" <${process.env.SMTP_USER}>`,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">CampusConnect</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Notification</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${firstName}!</h2>
            
            <div style="color: #555; line-height: 1.6; margin-bottom: 25px;">
              ${message}
            </div>
            
            ${actionButton}
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
              You can manage your notification preferences in your CampusConnect profile settings.
            </p>
          </div>
        </div>
      `,
      text: `
        ${subject} - CampusConnect
        
        Hi ${firstName},
        
        ${message}
        
        ${actionUrl ? `\n${actionText}: ${actionUrl}` : ''}
        
        You can manage your notification preferences in your CampusConnect profile settings.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Notification email sent:', info.messageId);
    return true;

  } catch (error) {
    console.error('❌ Failed to send notification email:', error);
    return false;
  }
};

// Send verification code email (code-based verification)
const sendVerificationCode = async (email, firstName, code) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"CampusKinect Team" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Complete your CampusKinect registration - Verification code inside',
              headers: {
          'List-Unsubscribe': '<mailto:campuskinect01@gmail.com?subject=unsubscribe>',
          'X-Mailer': 'CampusKinect/1.0',
          'X-Priority': '3'
        },
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">CampusKinect</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Account Verification</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${firstName}!</h2>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 25px;">
              Thanks for joining CampusKinect! To complete your registration, please enter the verification code below.
            </p>
            
            <div style="text-align: center; margin: 30px 0; padding: 20px; background: white; border-radius: 10px; border: 2px dashed #6B8E23;">
              <h3 style="color: #6B8E23; margin: 0 0 10px 0; font-size: 24px;">Your Verification Code</h3>
              <div style="font-size: 36px; font-weight: bold; color: #6B8E23; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${code}
              </div>
              <p style="color: #888; margin: 10px 0 0 0; font-size: 14px;">
                This code expires in 10 minutes
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
              If you didn't create a CampusKinect account, please ignore this email.
            </p>
          </div>
        </div>
      `,
      text: `
        CampusKinect - Account Verification
        
        Hi ${firstName},
        
        Welcome to CampusKinect! To complete your registration, please enter the verification code below in the app.
        
        Your Verification Code: ${code}
        (This code expires in 10 minutes)
        
        If you didn't create a CampusKinect account, please ignore this email.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification code email sent:', info.messageId);
    return true;

  } catch (error) {
    console.error('❌ Failed to send verification code email:', error);
    return false;
  }
};

// Test email service
const testEmailService = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email service is working correctly');
    return true;
  } catch (error) {
    console.error('❌ Email service test failed:', error);
    return false;
  }
};

module.exports = {
  createTransporter,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendNotificationEmail,
  sendVerificationCode,
  testEmailService
}; 