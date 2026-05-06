import { createAdminClient } from "@/lib/supabase-admin"
import type { ClinicUser, FeatureFlag, UserRole } from "@/lib/database.types"

// ─── Users ────────────────────────────────────────────────────────────────────
export async function listClinicUsers(): Promise<ClinicUser[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("clinic_users")
    .select("*")
    .order("role")
    .order("name")
  if (error) throw error
  return data
}

export async function updateUserRole(id: string, role: UserRole): Promise<ClinicUser> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("clinic_users")
    .update({ role })
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function toggleUserActive(id: string, active: boolean): Promise<ClinicUser> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("clinic_users")
    .update({ active })
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createClinicUser(
  user: Omit<ClinicUser, "id" | "created_at" | "updated_at">,
): Promise<ClinicUser> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("clinic_users")
    .insert(user)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Feature flags ─────────────────────────────────────────────────────────────
export async function listFeatureFlags(): Promise<FeatureFlag[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("feature_flags")
    .select("*")
    .order("key")
  if (error) throw error
  return data
}

export async function toggleFeatureFlag(
  id: string,
  enabled: boolean,
  updatedBy: string,
): Promise<FeatureFlag> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("feature_flags")
    .update({ enabled, updated_by: updatedBy })
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getFeatureFlagByKey(key: string): Promise<FeatureFlag | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("feature_flags")
    .select("*")
    .eq("key", key)
    .single()
  return data
}
