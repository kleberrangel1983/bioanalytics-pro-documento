import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { Database } from "./types"

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  // Fail-closed: if Supabase is not configured, deny all requests rather than allow
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Service misconfigured: missing Supabase credentials" },
      { status: 503 }
    )
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — required for Server Components to read auth state
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protected routes — redirect to /login if not authenticated
  const isProtected =
    pathname.startsWith("/staging") ||
    pathname.startsWith("/api/patients") ||
    pathname.startsWith("/api/appointments") ||
    pathname.startsWith("/api/triage") ||
    pathname.startsWith("/api/logs")

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Logged-in users don't need the login page
  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return response
}
