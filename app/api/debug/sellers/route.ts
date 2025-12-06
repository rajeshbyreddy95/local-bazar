import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.MIGRATION_SECRET || 'admin-secret'}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get all sellers
    const sellers = await User.find({ userType: 'seller' }).select('email shopName').limit(10);

    return NextResponse.json({
      sellerCount: sellers.length,
      sellers: sellers.map((s: any) => ({
        email: s.email,
        shopName: s.shopName || 'N/A',
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
