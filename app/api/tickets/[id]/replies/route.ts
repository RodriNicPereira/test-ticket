import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getClientIdFromToken } from '@/lib/auth/clientToken';
import { isAdmin } from '@/lib/auth/admin';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { content, attachments } = await req.json();

  const clientId = await getClientIdFromToken();
  const admin = Boolean(await isAdmin());

  const { id } = await params;

  const { data: ticket } = await supabaseAdmin
    .from('tickets')
    .select('client_id,status')
    .eq('id', id)
    .single();

  if (!ticket) {
    return NextResponse.json(
      { error: 'No encontrado' },
      { status: 404 }
    );
  }

  if (!admin) {
  const clientId = await getClientIdFromToken();

  if (!clientId || ticket.client_id !== clientId) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 403 }
    );
  }
}

  if (ticket.status === 'cerrado') {
    return NextResponse.json(
      { error: 'Ticket cerrado' },
      { status: 400 }
    );
  }

  const { data: reply, error } = await supabaseAdmin
    .from('ticket_replies')
    .insert({
      ticket_id: id,
      content: content || '',
      is_admin: admin,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  if (Array.isArray(attachments) && attachments.length > 0) {
    await supabaseAdmin
      .from('ticket_attachments')
      .insert(
        attachments.map((a) => ({
          ...a,
          ticket_id: id,
          reply_id: reply.id,
        }))
      );
  }

  await supabaseAdmin
    .from('tickets')
    .update({
      status: await admin ? 'respondido' : 'pendiente',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  return NextResponse.json({ reply });
}