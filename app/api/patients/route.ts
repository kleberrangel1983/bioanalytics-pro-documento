import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 200)
  const offset = Number(searchParams.get("offset") ?? 0)

  const supabase = await createClient()
  const { data, error, count } = await supabase
    .from("patients")
    .select("*", { count: "exact" })
    .order("name")
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, count, limit, offset })
}
