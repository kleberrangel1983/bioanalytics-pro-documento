import { NextRequest, NextResponse } from "next/server"

const VALID_ROLES = ["admin", "medico", "secretaria", "convidado"]

// Demo-only: sets a role cookie so the middleware RBAC can be tested without real auth.
// In production, replace with NextAuth / Supabase Auth session handling.
export function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const role = searchParams.get("role") ?? "convidado"
  const redirect = searchParams.get("redirect") ?? "/"

  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  const url = request.nextUrl.clone()
  url.pathname = redirect
  url.search = ""

  const response = NextResponse.redirect(url)
  response.cookies.set("bioanalytics-role", role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  })

  return response
}
