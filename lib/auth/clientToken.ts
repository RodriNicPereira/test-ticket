import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { supabaseAdmin } from '@/lib/supabase/server';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const COOKIE_NAME = 'client_token';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 días

export async function ensureClient(): Promise<string> {
  const existing = await getClientIdFromToken();
  if (existing) return existing;

  const { data, error } = await supabaseAdmin
    .from('clients')
    .insert({})
    .select('id')
    .single();
  if (error) throw error;

  await setClientToken(data.id);
  return data.id;
}

export async function setClientToken(clientId: string) {
  const token = await new SignJWT({ clientId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(SECRET);

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  });
}

export async function getClientIdFromToken(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);

    const clientId = payload.clientId as string;

    if (!clientId) return null;

    // VALIDAR EXISTENCIA REAL EN DB
    const { data } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .single();

    if (!data) {
      return null;
    }

    return clientId;
  } catch {
    return null;
  }
}