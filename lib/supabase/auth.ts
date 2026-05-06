import type { UserRole } from "./types"

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  name: string
}

export function extractRole(metadata: Record<string, unknown> | null): UserRole {
  const role = metadata?.role
  const valid: UserRole[] = ["admin", "medico", "secretaria", "paciente", "suporte"]
  return valid.includes(role as UserRole) ? (role as UserRole) : "paciente"
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin:      "Administrador",
  medico:     "Médico",
  secretaria: "Secretária",
  paciente:   "Paciente",
  suporte:    "Suporte",
}

export const ROLE_COLORS: Record<UserRole, string> = {
  admin:      "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  medico:     "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  secretaria: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  paciente:   "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  suporte:    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
}
