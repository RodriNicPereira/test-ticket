import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST() {
  try {
    const twoDaysAgo = new Date(
      Date.now() - 2 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: attachments, error } = await supabaseAdmin
      .from("ticket_attachments")
      .select(`
        id,
        blob_path,
        tickets!inner (
          id,
          status,
          closed_at
        )
      `)
      .eq("tickets.status", "cerrado")
      .lt("tickets.closed_at", twoDaysAgo);

    if (error) throw error;

    if (!attachments?.length) {
      return NextResponse.json({
        success: true,
        deleted: 0,
      });
    }

    for (const attachment of attachments) {
      if (!attachment.blob_path) continue;

      try {
        await del(attachment.blob_path, {
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        await supabaseAdmin
          .from("ticket_attachments")
          .delete()
          .eq("id", attachment.id);

      } catch (err) {
        console.error(
          "Error eliminando archivo:",
          attachment.blob_path,
          err
        );
      }
    }

    return NextResponse.json({
      success: true,
      deleted: attachments.length,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}