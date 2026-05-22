import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";

export async function GET(request: NextRequest) {
  try {
    const pathname = request.nextUrl.searchParams.get("pathname");

    if (!pathname) {
      return NextResponse.json(
        { error: "Missing pathname" },
        { status: 400 }
      );
    }

    const result = await get(pathname, {
      access: "private",
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    if (!result || result.statusCode !== 200) {
      return new NextResponse("Not found", {
        status: 404,
      });
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType,
        "Cache-Control": "private, no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error serving file" },
      { status: 500 }
    );
  }
}