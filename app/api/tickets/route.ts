import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { ensureClient, getClientIdFromToken } from '@/lib/auth/clientToken';

// GET /api/tickets → lista los tickets activos del cliente (según cookie)
export async function GET() {
  const clientId = await getClientIdFromToken();
  if (!clientId) return NextResponse.json({ tickets: [] });

  const { data, error } = await supabaseAdmin
    .from('tickets')
    .select(`*,ticket_replies(id,content,created_at,is_admin)`)
    .eq('client_id', clientId)
    .neq('status', 'cerrado')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tickets: data });
}

// POST /api/tickets → crea un ticket nuevo (crea cliente si no existe)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { categoria, subcategoria, mail, titular, grupo, detalle } = body;

  if (!categoria || !subcategoria || !mail || !titular || !detalle) {
    return NextResponse.json({ error: 'Faltan campos' }, { status: 400 });
  }

  const clientId = await ensureClient();

  const { data, error } = await supabaseAdmin
    .from('tickets')
    .insert({ client_id: clientId, categoria, subcategoria, mail, titular, grupo, detalle })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ticket: data });
}