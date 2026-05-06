import { createAdminClient } from "@/lib/supabase-admin"
import type { Appointment, AppointmentStatus } from "@/lib/database.types"

export interface AppointmentWithPatient extends Appointment {
  patients: { name: string; phone: string }
}

export async function listAppointmentsByDate(
  date: string,
  status?: AppointmentStatus,
): Promise<AppointmentWithPatient[]> {
  const supabase = createAdminClient()

  let query = supabase
    .from("appointments")
    .select("*, patients(name, phone)")
    .gte("scheduled_at", `${date}T00:00:00+00:00`)
    .lte("scheduled_at", `${date}T23:59:59+00:00`)
    .order("scheduled_at")

  if (status) query = query.eq("status", status)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as AppointmentWithPatient[]
}

export async function createAppointment(input: {
  patient_id: string
  type: string
  scheduled_at: string
  notes?: string
  created_by: string
}): Promise<Appointment> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("appointments")
    .insert({ ...input, status: "aguardando" })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  notes?: string,
): Promise<Appointment> {
  const supabase = createAdminClient()
  const update: Partial<Appointment> = { status }
  if (notes !== undefined) update.notes = notes

  const { data, error } = await supabase
    .from("appointments")
    .update(update)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  if (!data) throw new Error("Agendamento não encontrado")
  return data
}

export async function deleteAppointment(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from("appointments").delete().eq("id", id)
  if (error) throw error
}

// Find the most recent pending appointment for a given phone number.
// Used by the WhatsApp webhook to match SIM/CANCELAR replies.
export async function findPendingAppointmentByPhone(
  phone: string,
): Promise<AppointmentWithPatient | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("appointments")
    .select("*, patients!inner(name, phone)")
    .eq("patients.phone", phone)
    .in("status", ["aguardando", "confirmado"])
    .order("scheduled_at")
    .limit(1)
    .maybeSingle()
  return data as AppointmentWithPatient | null
}
