import { RequestHandler } from "express";
import nodemailer from "nodemailer";

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

// Create email transporter (using Gmail as example)
const createTransporter = () => {
  // For Gmail, you'll need to use App Password instead of regular password
  // Go to Google Account > Security > 2-Step Verification > App passwords
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'samreengulam12@gmail.com',
      pass: process.env.EMAIL_APP_PASSWORD // You'll need to set this
    }
  });
};

export const handleContactForm: RequestHandler = async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message }: ContactFormData = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({
        error: 'All fields are required'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Prepare email content
    const emailContent = {
      from: `"Portfolio Contact Form" <${process.env.EMAIL_USER || 'samreengulam12@gmail.com'}>`,
      to: 'samreengulam12@gmail.com',
      replyTo: email,
      subject: `Portfolio Contact: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>

          <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="color: #374151; margin-top: 0;">Message:</h3>
            <p style="line-height: 1.6; color: #374151;">${message.replace(/\n/g, '<br>')}</p>
          </div>

          <div style="margin-top: 20px; padding: 15px; background: #ecfdf5; border-radius: 8px; border-left: 4px solid #10b981;">
            <p style="margin: 0; color: #065f46;">
              <strong>📧 Reply directly to this email to respond to ${firstName}</strong>
            </p>
          </div>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="text-align: center; color: #6b7280; font-size: 12px;">
            Sent from your portfolio website contact form<br>
            ${new Date().toLocaleString()}
          </p>
        </div>
      `
    };

    // Try to send email if EMAIL_APP_PASSWORD is configured
    if (process.env.EMAIL_APP_PASSWORD) {
      try {
        const transporter = createTransporter();
        await transporter.sendMail(emailContent);
        console.log('Email sent successfully to samreengulam12@gmail.com');
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Continue anyway - log the submission
      }
    } else {
      console.log('EMAIL_APP_PASSWORD not configured - email not sent');
      console.log('To enable email sending, set EMAIL_APP_PASSWORD environment variable');
    }

    // Always log the submission
    console.log('Contact form submission:', {
      name: `${firstName} ${lastName}`,
      email,
      subject,
      message,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Message sent successfully! I\'ll get back to you soon.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      error: 'Failed to send message. Please try again or email directly.'
    });
  }
};
