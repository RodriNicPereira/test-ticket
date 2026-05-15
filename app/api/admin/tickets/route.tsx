import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/admin';

export async function GET(req: NextRequest) {
  const senderType = req.headers.get('x-sender-type');

  if (senderType !== 'admin') {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 403 }
    );
  }

  const admin = await isAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 401 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from('tickets')
    .select(`
      *,
      ticket_replies(
        *,
        ticket_attachments(*)
      ),
      ticket_attachments(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    tickets: data,
  });
}