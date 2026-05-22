import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { cva } from "class-variance-authority";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Archivo demasiado grande" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 });
    }

    const blobPath = `attachments-tickets/${Date.now()}-${file.name}`;

    const blob = await put(blobPath, file, {
      access: "private",
      contentType: file.type,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      file_url: blob.url,   // URL pública que guardás en ticket_attachments.file_url
      blob_path: blob.pathname, // se guarda en ticket_attachments.blob_path
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
