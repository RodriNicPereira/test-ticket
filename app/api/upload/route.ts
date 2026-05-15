import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getClientIdFromToken } from '@/lib/auth/clientToken';
import { isAdmin } from '@/lib/auth/admin';

export async function POST(req: NextRequest) {
 if (!(await getClientIdFromToken()) && !(await isAdmin())){
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'Sin archivo' }, { status: 400 });

  const blob = await put(`tickets/${Date.now()}-${file.name}`, file, {
    access: 'private',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return NextResponse.json({
    file_name: file.name,
    file_type: file.type,
    file_size: file.size,
    file_url: blob.downloadUrl,
  });
}