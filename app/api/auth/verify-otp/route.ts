import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { OTP } from "@/models/OTP";
import { User } from "@/models/User";
import { cacheSet, CACHE_KEYS } from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, otp } = body;

    // Validate input
    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Check if OTP exists in database
    const storedOtpDoc = await OTP.findOne({ email });

    if (!storedOtpDoc) {
      return NextResponse.json(
        { error: "OTP not found. Please request a new OTP." },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (Date.now() > storedOtpDoc.expiresAt.getTime()) {
      await OTP.deleteOne({ email });
      return NextResponse.json(
        { error: "OTP has expired. Please request a new OTP." },
        { status: 400 }
      );
    }

    // Verify OTP
    if (otp.toString() !== storedOtpDoc.code) {
      return NextResponse.json(
        { error: "Invalid OTP. Please try again." },
        { status: 400 }
      );
    }

    // OTP is valid - Save user to database
    const userData = storedOtpDoc.userData;
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email: userData.email,
        fullName: userData.fullName,
        phone: userData.phone,
        password: userData.password,
        userType: userData.userType,
        shopName: userData.shopName,
        shopAddress: userData.shopAddress,
        landmarks: userData.landmarks,
        pincode: userData.pincode,
        isVerified: true,
      });
      await user.save();
    } else {
      user.isVerified = true;
      await user.save();
    }

    // Create session data
    const sessionData = {
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      userType: user.userType,
      shopName: user.shopName,
      shopAddress: user.shopAddress,
      landmarks: user.landmarks,
      pincode: user.pincode,
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    // Remove OTP from database after verification
    await OTP.deleteOne({ email });

    // Create response with session cookie (7 days)
    const response = NextResponse.json(
      {
        success: true,
        message: "OTP verified successfully",
        user: sessionData,
      },
      { status: 200 }
    );

    // Set secure http-only cookie with session data
    response.cookies.set("auth_session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    // Cache user session for 7 days (signup)
    const cacheKey = CACHE_KEYS.USER(user.email);
    await cacheSet(cacheKey, sessionData, 7 * 24 * 60 * 60);
    console.log(`📝 Cached user session (Signup): ${cacheKey}`);

    return response;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
