import type { AuthUser, LoginCredentials, LoginResult, AuthSession } from "./types"

// One mock user per role — no real PII, only staging/demo credentials
export const MOCK_USERS: AuthUser[] = [
  {
    id: "usr_admin_001",
    name: "Carlos Administrador",
    email: "admin@bioanalytics.local",
    role: "admin",
    avatarInitials: "CA",
    department: "Gestão",
  },
  {
    id: "usr_med_017",
    name: "Dra. Maria Homologação",
    email: "medico@bioanalytics.local",
    role: "medico",
    avatarInitials: "MH",
    department: "Clínica",
  },
  {
    id: "usr_sec_008",
    name: "Ana Secretária",
    email: "secretaria@bioanalytics.local",
    role: "secretaria",
    avatarInitials: "AS",
    department: "Recepção",
  },
  {
    id: "usr_pat_099",
    name: "João Paciente",
    email: "paciente@bioanalytics.local",
    role: "paciente",
    avatarInitials: "JP",
    department: "—",
  },
  {
    id: "usr_sup_003",
    name: "Pedro Suporte",
    email: "suporte@bioanalytics.local",
    role: "suporte",
    avatarInitials: "PS",
    department: "TI / Suporte",
  },
]

// All accounts share the same demo password in staging
const DEMO_PASSWORD = "bio2026"

const USER_BY_EMAIL = Object.fromEntries(MOCK_USERS.map((u) => [u.email, u]))

export function authenticateUser(credentials: LoginCredentials): LoginResult & { user?: AuthUser } {
  const user = USER_BY_EMAIL[credentials.email.toLowerCase().trim()]
  if (!user) return { ok: false, error: "E-mail não encontrado." }
  if (credentials.password !== DEMO_PASSWORD) return { ok: false, error: "Senha incorreta." }
  return { ok: true, user }
}

export function createSession(user: AuthUser): AuthSession {
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() // 8h
  return {
    user,
    token: `mock-jwt-${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    expiresAt,
  }
}

export function isSessionValid(session: AuthSession): boolean {
  return new Date(session.expiresAt) > new Date()
}

export const SESSION_KEY = "bioanalytics_session"
