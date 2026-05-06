"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import {
  authenticateUser,
  createSession,
  isSessionValid,
  SESSION_KEY,
} from "./mock-users"
import type { AuthSession, AuthState, LoginCredentials, LoginResult, AuthUser } from "./types"

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<LoginResult>
  logout: () => void
  user: AuthUser | null
}

const AUTH_COOKIE = "bioanalytics_auth"
const SESSION_TTL_SECONDS = 8 * 60 * 60 // 8h

function setAuthCookie(token: string) {
  document.cookie = `${AUTH_COOKIE}=${token}; path=/; max-age=${SESSION_TTL_SECONDS}; SameSite=Lax`
}

function clearAuthCookie() {
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0`
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ session: null, isLoading: true })

  // Rehydrate session from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (raw) {
        const session: AuthSession = JSON.parse(raw)
        if (isSessionValid(session)) {
          setState({ session, isLoading: false })
          return
        }
        localStorage.removeItem(SESSION_KEY)
        clearAuthCookie()
      }
    } catch {
      localStorage.removeItem(SESSION_KEY)
      clearAuthCookie()
    }
    setState({ session: null, isLoading: false })
  }, [])

  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResult> => {
    const result = authenticateUser(credentials)
    if (!result.ok || !result.user) return { ok: false, error: result.error }

    const session = createSession(result.user)
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setAuthCookie(session.token)
    setState({ session, isLoading: false })
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    clearAuthCookie()
    setState({ session: null, isLoading: false })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        ...state,
        user: state.session?.user ?? null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
