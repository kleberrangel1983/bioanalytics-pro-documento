import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { parsePagination } from "@/lib/supabase/pagination"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parsePagination(searchParams)
  if ("error" in page) return NextResponse.json({ error: page.error }, { status: page.status })
  const { limit, offset } = page

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
