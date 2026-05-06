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
      }
    } catch {
      localStorage.removeItem(SESSION_KEY)
    }
    setState({ session: null, isLoading: false })
  }, [])

  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResult> => {
    const result = authenticateUser(credentials)
    if (!result.ok || !result.user) return { ok: false, error: result.error }

    const session = createSession(result.user)
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setState({ session, isLoading: false })
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
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
