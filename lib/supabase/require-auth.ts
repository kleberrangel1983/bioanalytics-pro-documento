import { NextResponse } from "next/server"
import { createClient } from "./server"
import { extractRole } from "./auth"
import type { UserRole } from "./types"

export interface AuthContext {
  userId: string
  role: UserRole
}

/**
 * Verifies Supabase session and extracts the caller's role.
 * Returns { ctx } on success or { response } (401/403) on failure.
 */
export async function requireAuth(): Promise<
  { ctx: AuthContext; response?: never } | { ctx?: never; response: NextResponse }
> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  const role = extractRole(user.user_metadata)
  if (!role) {
    return { response: NextResponse.json({ error: "Forbidden: unrecognized role" }, { status: 403 }) }
  }

  return { ctx: { userId: user.id, role } }
}
