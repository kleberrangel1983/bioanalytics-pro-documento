import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Service-role client — bypasses RLS. Never expose to the browser.
// Requires SUPABASE_SERVICE_ROLE_KEY (not the anon key).
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
      "Add them to your environment variables.",
    )
  }

  return createClient<Database>(url, key, {
    auth: { persistSession: false },
  })
}
