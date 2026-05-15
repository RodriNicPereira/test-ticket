import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getClientIdFromToken } from '@/lib/auth/clientToken';
import { isAdmin } from '@/lib/auth/admin';

export async function GET( req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
// Obtener el tipo de remitente desde el header
  const senderType = req.headers.get('x-sender-type');

const admin =
  senderType === 'admin'
    ? await isAdmin()
    : false;


  const { data: ticket, error } = await supabaseAdmin
    .from('tickets')
    .select(`
      *,
      ticket_replies(
        *,
        ticket_attachments(*)
      ),
      ticket_attachments(*)
    `)
    .eq('id', id)
    .single();

  if (error || !ticket) {
    return NextResponse.json(
      { error: 'No encontrado' },
      { status: 404 }
    );
  }

  // SOLO valida ownership si NO es admin
  if (!admin) {
    const clientId = await getClientIdFromToken();

    if (!clientId || ticket.client_id !== clientId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }
  }

  return NextResponse.json({ ticket });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { status } = await req.json();

  // Obtener el tipo de remitente desde el header
  const senderType = req.headers.get('x-sender-type');

const admin =
  senderType === 'admin'
    ? await isAdmin()
    : false;


  const { data: ticket } = await supabaseAdmin
    .from('tickets')
    .select('client_id')
    .eq('id', id)
    .single();

  if (!ticket) {
    return NextResponse.json(
      { error: 'No encontrado' },
      { status: 404 }
    );
  }

  // SOLO cliente valida ownership
  if (!admin) {
    const clientId = await getClientIdFromToken();

    if (!clientId || ticket.client_id !== clientId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }
  }

  const update: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === 'cerrado') {
    update.closed_at = new Date().toISOString();
  }

  const { error } = await supabaseAdmin
    .from('tickets')
    .update(update)
    .eq('id', id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}