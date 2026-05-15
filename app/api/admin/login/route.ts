import { NextRequest, NextResponse } from 'next/server';
import { createAdminSession } from '@/lib/auth/admin';

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: 'Contraseña inválida' },
      { status: 401 }
    );
  }

  await createAdminSession();

  return NextResponse.json({
    ok: true,
  });
}