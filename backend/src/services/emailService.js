const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send verification email
const sendVerificationEmail = async (email, firstName, token) => {
  try {
    const transporter = createTransporter();
    
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
    console.log('✅ Verification email sent:', info.messageId);
    return true;

  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
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
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendNotificationEmail,
  testEmailService
}; 