import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const COOKIE_NAME = 'admin_session';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET
);

const MAX_AGE = 60 * 60 * 24 * 3; // 3 días

export async function createAdminSession() {
  const token = await new SignJWT({
    role: 'admin',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('3d')
    .sign(SECRET);

  (await cookies()).set(COOKIE_NAME, token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: MAX_AGE,
  });
}

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;

  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, SECRET);

    return payload.role === 'admin';
  } catch {
    return false;
  }
}

export async function destroyAdminSession() {
  (await cookies()).set(COOKIE_NAME, '', {
  path: '/',
  expires: new Date(0),
});
}