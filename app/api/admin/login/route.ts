import { NextRequest, NextResponse } from "next/server";
import { createAdminSession } from "@/lib/auth/admin";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

console.log(process.env.ADMIN_PASSWORD_HASH);

    const isValid = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH!
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Contraseña inválida" },
        { status: 401 }
      );
    }

    await createAdminSession();

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}

/*export async function POST(req: NextRequest) {
  const { password } = await req.json();

  console.log("PASSWORD:", password);
  console.log("HASH:", process.env.ADMIN_PASSWORD_HASH);

  const isValid = await bcrypt.compare(
    password,
    process.env.ADMIN_PASSWORD_HASH!
  );

  console.log("VALID:", isValid);

  return NextResponse.json({ isValid });
}
*/