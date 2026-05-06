import { createAdminClient } from "@/lib/supabase-admin"
import type { Patient } from "@/lib/database.types"

export async function getPatientByPhone(phone: string): Promise<Patient | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("patients")
    .select("*")
    .eq("phone", phone)
    .maybeSingle()
  return data
}

export async function searchPatients(query: string): Promise<Patient[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .or(`name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
    .order("name")
    .limit(20)
  if (error) throw error
  return data ?? []
}

export async function upsertPatient(
  patient: { name: string; phone: string; email?: string },
): Promise<Patient> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("patients")
    .upsert(patient, { onConflict: "phone" })
    .select()
    .single()
  if (error) throw error
  return data
}
