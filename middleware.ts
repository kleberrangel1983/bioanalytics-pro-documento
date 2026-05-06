import { NextRequest, NextResponse } from "next/server"

const PUBLIC_PATHS = ["/login", "/auth"]
const AUTH_COOKIE = "bioanalytics_auth"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  if (!isPublic) {
    const authCookie = req.cookies.get(AUTH_COOKIE)
    if (!authCookie?.value) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("from", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
