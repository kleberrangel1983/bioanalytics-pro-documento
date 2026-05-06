import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ADMIN_ONLY  = ["/auditoria", "/admin"]
const ADMIN_ROLES = ["admin"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (ADMIN_ONLY.some((route) => pathname.startsWith(route))) {
    const role = request.cookies.get("bioanalytics-role")?.value

    if (!role || !ADMIN_ROLES.includes(role)) {
      const url = request.nextUrl.clone()
      url.pathname = "/acesso-negado"
      url.searchParams.set("from", pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/auditoria/:path*", "/admin/:path*"],
}
