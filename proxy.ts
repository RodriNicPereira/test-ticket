import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET
);

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";

  // Solo proteger rutas admin
  if (!isAdminRoute) {
    return NextResponse.next();
  }

  const token =
    req.cookies.get("admin_session")?.value;

  // Si NO tiene token y NO está en login
  if (!token && !isLoginPage) {
    return NextResponse.redirect(
      new URL("/admin/login", req.url)
    );
  }

  // Si YA tiene token e intenta entrar al login
  if (token && isLoginPage) {
    try {
      await jwtVerify(token, SECRET);

      return NextResponse.redirect(
        new URL("/admin", req.url)
      );
    } catch {
      // Si token inválido, eliminar cookie
      const response = NextResponse.next();

      response.cookies.delete("admin_session");

      return response;
    }
  }

  // Verificar token en rutas protegidas
  if (!isLoginPage) {
    try {
      await jwtVerify(token!, SECRET);
    } catch {
      const response = NextResponse.redirect(
        new URL("/admin/login", req.url)
      );

      response.cookies.delete("admin_session");

      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};