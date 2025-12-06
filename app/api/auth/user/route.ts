import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { cacheGet, cacheSet, CACHE_KEYS } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      );
    }

    // Check cache first for user data
    const cacheKey = CACHE_KEYS.USER(user.email);
    const cachedUser = await cacheGet(cacheKey);
    if (cachedUser) {
      console.log(`✅ Cache HIT (User): ${cacheKey}`);
      return NextResponse.json(
        { user: cachedUser, source: 'cache' },
        { status: 200 }
      );
    }

    // Cache user data for 7 days
    console.log(`📝 Cache MISS (User): ${cacheKey}`);
    await cacheSet(cacheKey, user, 7 * 24 * 60 * 60);
    console.log(`📝 Cached user data: ${cacheKey}`);

    return NextResponse.json(
      { user, source: 'database' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error getting user:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}
