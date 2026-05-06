import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { parsePagination } from "@/lib/supabase/pagination"
import { requireAuth } from "@/lib/supabase/require-auth"

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth.response) return auth.response
  if (!["admin", "suporte"].includes(auth.ctx.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const actor_id      = searchParams.get("actor_id")
  const resource_type = searchParams.get("resource_type")
  const page = parsePagination(searchParams, { limit: 100, maxLimit: 500 })
  if ("error" in page) return NextResponse.json({ error: page.error }, { status: page.status })
  const { limit, offset } = page

  const supabase = await createClient()
  let query = supabase
    .from("audit_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (actor_id)      query = query.eq("actor_id", actor_id)
  if (resource_type) query = query.eq("resource_type", resource_type)

  const { data, error, count } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, count, limit, offset })
}
