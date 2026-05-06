import { NextRequest, NextResponse } from "next/server"

// Middleware is minimal — client-side AuthGuard handles the session check
// (localStorage is not accessible server-side)
export function middleware(_req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
