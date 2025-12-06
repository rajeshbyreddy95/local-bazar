import { cookies } from 'next/headers';

export interface UserSession {
  email: string;
  fullName: string;
  phone: string;
  userType: 'buyer' | 'seller';
  shopName?: string;
  shopAddress?: string;
  landmarks?: string;
  pincode?: string;
  createdAt: number;
  expiresAt: number;
}

export async function getAuthUser(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_session');

    if (!sessionCookie) {
      return null;
    }

    const session = JSON.parse(sessionCookie.value);

    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      cookieStore.delete('auth_session');
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error getting user session:', error);
    return null;
  }
}
