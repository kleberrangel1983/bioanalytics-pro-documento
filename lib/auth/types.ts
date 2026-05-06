import type { UserRole, Permission } from "@/lib/staging/types"

export type { UserRole }

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  avatarInitials: string
  department: string
}

export interface AuthSession {
  user: AuthUser
  token: string
  expiresAt: string
}

export interface AuthState {
  session: AuthSession | null
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResult {
  ok: boolean
  error?: string
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  medico: "Médico",
  secretaria: "Secretária",
  paciente: "Paciente",
  suporte: "Suporte",
}

export const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  medico: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  secretaria: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  paciente: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  suporte: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
}
