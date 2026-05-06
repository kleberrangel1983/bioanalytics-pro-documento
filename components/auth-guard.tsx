"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth/context"
import { isSessionValid } from "@/lib/auth/mock-users"

const PUBLIC_PATHS = ["/login"]

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isPublic = PUBLIC_PATHS.includes(pathname)
  const isAuthed = !!session && isSessionValid(session)

  useEffect(() => {
    if (isLoading) return
    if (!isAuthed && !isPublic) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`)
    }
    if (isAuthed && isPublic) {
      router.replace("/")
    }
  }, [isLoading, isAuthed, isPublic, router, pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    )
  }

  if (!isAuthed && !isPublic) return null
  if (isAuthed && isPublic) return null

  return <>{children}</>
}
