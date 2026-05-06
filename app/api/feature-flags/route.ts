import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const EnvSchema = z.enum(["staging", "production"])

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const env = EnvSchema.safeParse(searchParams.get("env") ?? "staging")
  if (!env.success) {
    return NextResponse.json({ error: "env must be 'staging' or 'production'" }, { status: 422 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("feature_flags_state")
    .select("*")
    .eq("environment", env.data)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, environment: env.data })
}
