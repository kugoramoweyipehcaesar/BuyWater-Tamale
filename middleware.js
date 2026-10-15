import { NextResponse } from "next/server";

const TOKEN_NAME = "buywater_token";
const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"];

function decodeJwtPayload(token) {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isAdminRole(role) {
  return ADMIN_ROLES.includes(String(role || "").toUpperCase());
}

/**
 * Fast middleware: no Prisma / no internal fetch on every request.
 * Maintenance is enforced client-side + on sensitive API routes.
 * Rider→admin redirect stays (JWT decode only, no DB).
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/.env") ||
    pathname.includes("wp-admin") ||
    pathname.includes("phpmyadmin") ||
    pathname.endsWith(".php")
  ) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname === "/favicon.ico" ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".css") ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js"
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin-login")) {
    const token = request.cookies.get(TOKEN_NAME)?.value;
    const payload = token ? decodeJwtPayload(token) : null;
    if (String(payload?.role || "").toUpperCase() === "RIDER") {
      return NextResponse.redirect(new URL("/rider", request.url));
    }
  }

  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
