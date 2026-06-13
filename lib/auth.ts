import { cookies } from 'next/headers';
import { verifyJWT, JWTPayload } from './jwt';

export async function getCurrentUser(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return null;
    }

    return await verifyJWT(token);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('Dynamic server usage') || (error as any).digest === 'DYNAMIC_SERVER_USAGE')
    ) {
      throw error;
    }
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

export async function hasRole(role: 'manager' | 'designer'): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return user.role === role;
}
