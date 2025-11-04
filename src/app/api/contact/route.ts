import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email to photographer
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER || 'aminoss.photography@gmail.com',
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #c67548;">New Contact Form Submission</h2>
          <hr style="border: 1px solid #eee;">
          
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          
          <h3 style="color: #333; margin-top: 20px;">Message:</h3>
          <p style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
            ${message.replace(/\n/g, '<br>')}
          </p>
          
          <hr style="border: 1px solid #eee; margin-top: 30px;">
          <p style="color: #666; font-size: 12px;">
            This email was sent from the contact form on Aminoss Photography website.
          </p>
        </div>
      `,
      replyTo: email,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Send confirmation email to sender
    const confirmationMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Thank you for contacting Aminoss Photography',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #c67548;">Thank You for Reaching Out!</h2>
          <hr style="border: 1px solid #eee;">
          
          <p>Hi ${name},</p>
          
          <p>Thank you for contacting Aminoss Photography. I've received your message and will get back to you as soon as possible, usually within 24 hours.</p>
          
          <h3 style="color: #333; margin-top: 20px;">Your Message:</h3>
          <p style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
            ${message.replace(/\n/g, '<br>')}
          </p>
          
          <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>Aminoss</strong><br>
            <span style="color: #666;">Professional Photographer</span>
          </p>
          
          <hr style="border: 1px solid #eee; margin-top: 30px;">
          <p style="color: #666; font-size: 12px;">
            📧 aminoss.photography@gmail.com<br>
            📍 Tunis, Tunisia
          </p>
        </div>
      `,
    };

    await transporter.sendMail(confirmationMailOptions);

    return NextResponse.json(
      { message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email. Please try again later.' },
      { status: 500 }
    );
  }
}
