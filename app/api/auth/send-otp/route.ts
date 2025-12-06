import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { OTP } from '@/models/OTP';

// Initialize nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, fullName, userType, phone, password, shopName, shopAddress, landmarks, pincode } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP in MongoDB
    await OTP.findOneAndUpdate(
      { email },
      {
        email,
        code: otp,
        expiresAt: new Date(expiresAt),
        userData: { email, fullName, userType, phone, password, shopName, shopAddress, landmarks, pincode },
      },
      { upsert: true, new: true }
    );

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Local Bazar - Verify Your Email with OTP',
      html: `
        <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ccf5d1 0%, #a8e6c1 100%); padding: 40px; border-radius: 16px; text-align: center;">
            <h1 style="color: #1b5e20; font-size: 28px; margin: 0 0 10px 0;">🛒 Local Bazar</h1>
            <p style="color: #689f38; font-size: 14px; margin: 0;">Your Local Online Marketplace</p>
          </div>
          
          <div style="padding: 40px; background: #f9fdf7; border-radius: 16px; margin-top: 20px;">
            <h2 style="color: #1b5e20; font-size: 22px; margin-bottom: 20px;">Email Verification</h2>
            
            <p style="color: #2e7d32; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Hi <strong>${fullName}</strong>,
            </p>
            
            <p style="color: #2e7d32; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Welcome to Local Bazar! Please use the code below to verify your email address and complete your registration.
            </p>
            
            <div style="background: white; border: 2px solid #689f38; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
              <p style="color: #999; font-size: 14px; margin: 0 0 15px 0;">Your verification code:</p>
              <p style="font-size: 40px; font-weight: bold; color: #1b5e20; letter-spacing: 8px; margin: 0;">${otp}</p>
              <p style="color: #999; font-size: 12px; margin: 15px 0 0 0;">This code will expire in 5 minutes</p>
            </div>
            
            <p style="color: #2e7d32; font-size: 16px; line-height: 1.6; margin-bottom: 10px;">
              If you didn't request this code, you can safely ignore this email.
            </p>
            
            <p style="color: #2e7d32; font-size: 16px; line-height: 1.6;">
              Account type: <strong>${userType.charAt(0).toUpperCase() + userType.slice(1)}</strong>
            </p>
          </div>
          
          <div style="background: #1b5e20; color: white; padding: 30px; border-radius: 16px; margin-top: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">
              © 2025 Local Bazar. All rights reserved.
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px;">
              Made with 💚 for local communities
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: 'OTP sent successfully', email },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
