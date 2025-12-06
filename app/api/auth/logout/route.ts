import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { cacheDelete, CACHE_KEYS } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();

    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear the auth session cookie
    response.cookies.delete('auth_session');

    // Clear user cache on logout
    if (user) {
      const cacheKey = CACHE_KEYS.USER(user.email);
      await cacheDelete(cacheKey);
      console.log(`🗑️  Cache cleared (Logout): ${cacheKey}`);
    }

    return response;
  } catch (error) {
    console.error('Error logging out:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
