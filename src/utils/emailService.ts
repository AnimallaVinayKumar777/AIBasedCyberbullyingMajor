import emailjs from '@emailjs/browser';

// EmailJS configuration - Replace with your actual service details
const EMAILJS_SERVICE_ID = 'service_xf3cvst'; // Replace with your EmailJS service ID
const EMAILJS_TEMPLATE_ID = 'template_dr9q00k'; // Replace with your EmailJS template ID
const EMAILJS_PUBLIC_KEY = 'xe6zm779fJ2mIn8lI'; // Replace with your EmailJS public key

export interface EmailData extends Record<string, unknown> {
  to_email: string;
  to_name: string;
  subject: string;
  message: string;
  post_content?: string;
  user_handle?: string;
}

export class EmailService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Initialize EmailJS with your public key
    emailjs.init(EMAILJS_PUBLIC_KEY);
    this.initialized = true;
    console.log('📧 EmailJS initialized');
  }

  async sendAccountWarningEmail(userEmail: string, userName: string, postContent: string, userHandle: string): Promise<boolean> {
    // Validate email is provided
    if (!userEmail || userEmail.trim() === '') {
      console.error('📧 ❌ No email address provided - cannot send warning email');
      return false;
    }
    
    console.log('📧 ============================================');
    console.log('📧 Starting email send process...');
    console.log('📧 User email:', userEmail);
    console.log('📧 User name:', userName);
    console.log('📧 User handle:', userHandle);
    console.log('📧 Post content:', postContent);
    console.log('📧 Service ID:', EMAILJS_SERVICE_ID);
    console.log('📧 Template ID:', EMAILJS_TEMPLATE_ID);
    console.log('📧 Public Key:', EMAILJS_PUBLIC_KEY.substring(0, 5) + '...');
    console.log('📧 ============================================');
    
    try {
      await this.initialize();
      console.log('📧 EmailJS initialized successfully');

      const templateParams = {
        to_email: userEmail,
        to_name: userName,
        subject: 'Account Warning: Content Policy Violation',
        message: `Dear ${userName},

Your recent post on SafeNet has been flagged for containing content that violates our community guidelines. The post in question was:

"${postContent}"

As this is a violation of our policies, your account may be subject to suspension or banning if repeated violations occur.

To avoid future issues, please ensure all content complies with our community guidelines:
- No harassment or bullying
- No hate speech
- No threats or violence
- Respect for all users

If you believe this was flagged in error, please contact our moderation team.

Best regards,
SafeNet Moderation Team`,
        post_content: postContent,
        user_handle: userHandle
      };

      console.log('📧 Sending email with params:', JSON.stringify(templateParams, null, 2));
      
      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      console.log('📧 ✅ Email sent successfully!');
      console.log('📧 Result status:', result.status);
      console.log('📧 Result text:', result.text);
      return true;
    } catch (error: any) {
      console.error('📧 ❌ Email send failed!');
      console.error('📧 Error name:', error.name);
      console.error('📧 Error message:', error.message);
      console.error('📧 Error text:', error.text);
      console.error('📧 Full error:', error);
      return false;
    }
  }

  async sendDeactivationWarningEmail(userEmail: string, userName: string, postContent: string, userHandle: string): Promise<boolean> {
    // Validate email is provided
    if (!userEmail || userEmail.trim() === '') {
      console.error('📧 ❌ No email address provided - cannot send deactivation warning email');
      return false;
    }
    
    try {
      await this.initialize();

      const templateParams = {
        to_email: userEmail,
        to_name: userName,
        subject: 'Account Deactivation Warning: Edit Time Expired',
        message: `Dear ${userName},

Your recent post on SafeNet containing violent or cyberbullying content has not been edited within the allowed time frame. The post in question was:

"${postContent}"

As you failed to edit the content within the 5-minute window, your account will be deactivated or banned if this behavior continues.

To prevent account deactivation:
- Edit harmful content promptly when notified
- Avoid posting violent or bullying content
- Follow our community guidelines

If you believe this was flagged in error, please contact our moderation team immediately.

Best regards,
SafeNet Moderation Team`,
        post_content: postContent,
        user_handle: userHandle
      };

      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      console.log('📧 Deactivation warning email sent successfully:', result);
      return true;
    } catch (error) {
      console.error('❌ Failed to send deactivation warning email:', error);
      return false;
    }
  }

  async sendCustomEmail(emailData: EmailData): Promise<boolean> {
    // Validate email is provided
    if (!emailData.to_email || emailData.to_email.trim() === '') {
      console.error('📧 ❌ No email address provided - cannot send custom email');
      return false;
    }
    
    try {
      await this.initialize();

      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        emailData
      );

      console.log('📧 Custom email sent successfully:', result);
      return true;
    } catch (error) {
      console.error('❌ Failed to send custom email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();

// Test function to verify email is working - call this in browser console
// Usage: await window.testEmailFunction('your@email.com', 'Your Name', '@yourhandle')
async function testEmailFunction(userEmail?: string, userName?: string, userHandle?: string) {
  console.log('🧪 ====== Testing Email Service ======');
  
  const emailService = new EmailService();
  
  // Use provided values or prompt for them
  const email = userEmail || prompt('Enter your email address:') || 'test@example.com';
  const name = userName || prompt('Enter your name:') || 'Test User';
  const handle = userHandle || prompt('Enter your handle:') || '@testuser';
  
  console.log('🧪 Testing with:');
  console.log('🧪 Email:', email);
  console.log('🧪 Name:', name);
  console.log('🧪 Handle:', handle);
  
  const result = await emailService.sendAccountWarningEmail(
    email,
    name,
    'This is a test post to verify email is working',
    handle
  );
  
  console.log('🧪 ====== Test Result ======');
  console.log('🧪 Email sent:', result);
  return result;
}

// Expose test function to window
Object.assign(window, { testEmailFunction });

// Old test function (kept for compatibility)
(window as any).testEmail = async () => {
  console.log('🧪 Using legacy testEmail - use testEmailFunction instead');
  return testEmailFunction();
};