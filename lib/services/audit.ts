import { createAdminClient } from "@/lib/supabase-admin"
import type { AuditLogRow, AuditSeverity, UserRole } from "@/lib/database.types"

export interface WriteAuditParams {
  userEmail: string
  userRole: UserRole
  action: string
  resource: string
  ip: string
  severity?: AuditSeverity
  details?: string
  success?: boolean
}

// Write an audit event — call this from any Route Handler after significant actions.
export async function writeAudit(params: WriteAuditParams): Promise<void> {
  try {
    const supabase = createAdminClient()
    await supabase.from("audit_logs").insert({
      user_email: params.userEmail,
      user_role: params.userRole,
      action: params.action,
      resource: params.resource,
      ip: params.ip,
      severity: params.severity ?? "info",
      details: params.details ?? null,
      success: params.success ?? true,
    })
  } catch {
    // Audit failures must never break the main request flow
    console.error("[audit] Failed to write audit log", params.action)
  }
}

export interface ListAuditParams {
  severity?: AuditSeverity
  userRole?: UserRole
  from?: string
  to?: string
  limit?: number
}

export async function listAuditLogs(params: ListAuditParams = {}): Promise<AuditLogRow[]> {
  const supabase = createAdminClient()
  const limit = Math.min(params.limit ?? 100, 500)

  let query = supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (params.severity) query = query.eq("severity", params.severity)
  if (params.userRole) query = query.eq("user_role", params.userRole)
  if (params.from) query = query.gte("created_at", params.from)
  if (params.to) query = query.lte("created_at", params.to)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}
