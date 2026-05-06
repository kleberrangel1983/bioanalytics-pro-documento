import { describe, it, expect } from "vitest"
import { authenticateUser, createSession, isSessionValid, MOCK_USERS } from "@/lib/auth/mock-users"
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/auth/types"

// ─── authenticateUser ────────────────────────────────────────────────────────

describe("authenticateUser", () => {
  it("rejects unknown email", () => {
    const result = authenticateUser({ email: "ninguem@x.com", password: "bio2026" })
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/não encontrado/i)
  })

  it("rejects wrong password", () => {
    const result = authenticateUser({ email: "admin@bioanalytics.local", password: "errada" })
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/incorreta/i)
  })

  it("accepts valid credentials for every mock user", () => {
    for (const user of MOCK_USERS) {
      const result = authenticateUser({ email: user.email, password: "bio2026" })
      expect(result.ok).toBe(true)
      expect(result.user?.id).toBe(user.id)
      expect(result.user?.role).toBe(user.role)
    }
  })

  it("is case-insensitive for email", () => {
    const result = authenticateUser({ email: "ADMIN@BIOANALYTICS.LOCAL", password: "bio2026" })
    expect(result.ok).toBe(true)
  })

  it("trims whitespace from email", () => {
    const result = authenticateUser({ email: "  medico@bioanalytics.local  ", password: "bio2026" })
    expect(result.ok).toBe(true)
  })
})

// ─── createSession ────────────────────────────────────────────────────────────

describe("createSession", () => {
  const user = MOCK_USERS[0]

  it("produces a session with a non-empty token", () => {
    const session = createSession(user)
    expect(session.token).toBeTruthy()
  })

  it("embeds the user in the session", () => {
    const session = createSession(user)
    expect(session.user.id).toBe(user.id)
    expect(session.user.role).toBe(user.role)
  })

  it("sets expiry ~8h in the future", () => {
    const before = Date.now()
    const session = createSession(user)
    const expiresMs = new Date(session.expiresAt).getTime()
    const diffHours = (expiresMs - before) / (1000 * 60 * 60)
    expect(diffHours).toBeGreaterThan(7.9)
    expect(diffHours).toBeLessThan(8.1)
  })

  it("generates unique tokens across calls", () => {
    const s1 = createSession(user)
    const s2 = createSession(user)
    expect(s1.token).not.toBe(s2.token)
  })
})

// ─── isSessionValid ───────────────────────────────────────────────────────────

describe("isSessionValid", () => {
  const user = MOCK_USERS[0]

  it("returns true for a freshly created session", () => {
    const session = createSession(user)
    expect(isSessionValid(session)).toBe(true)
  })

  it("returns false for an expired session", () => {
    const session = createSession(user)
    const expired = { ...session, expiresAt: new Date(Date.now() - 1000).toISOString() }
    expect(isSessionValid(expired)).toBe(false)
  })
})

// ─── MOCK_USERS coverage ──────────────────────────────────────────────────────

describe("MOCK_USERS", () => {
  it("has exactly one user per role", () => {
    const roles = MOCK_USERS.map((u) => u.role)
    const unique = new Set(roles)
    expect(unique.size).toBe(MOCK_USERS.length)
  })

  it("each user has avatarInitials of length 2", () => {
    for (const u of MOCK_USERS) {
      expect(u.avatarInitials).toHaveLength(2)
    }
  })

  it("all roles have a label in ROLE_LABELS", () => {
    for (const u of MOCK_USERS) {
      expect(ROLE_LABELS[u.role]).toBeTruthy()
    }
  })

  it("all roles have a color in ROLE_COLORS", () => {
    for (const u of MOCK_USERS) {
      expect(ROLE_COLORS[u.role]).toBeTruthy()
    }
  })
})
