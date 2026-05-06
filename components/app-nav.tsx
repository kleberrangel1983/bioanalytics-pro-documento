"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, FlaskConical, ChevronDown, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth/context"
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/auth/types"
import { ROLE_PERMISSIONS } from "@/lib/staging/mock-data"

const NAV_LINKS = [
  { label: "Dashboard", href: "/" },
  { label: "Fluxo E2E", href: "/staging" },
  { label: "Carga", href: "/staging/carga" },
  { label: "Feature Flags", href: "/staging/flags" },
  { label: "Go-live", href: "/staging/golive" },
  { label: "Obs.", href: "/staging/observabilidade" },
  { label: "LGPD", href: "/staging/lgpd" },
]

export function AppNav() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  if (!user) return null

  const perms = ROLE_PERMISSIONS[user.role]

  function handleLogout() {
    logout()
    router.replace("/login")
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 h-12 flex items-center gap-4">

        {/* brand */}
        <Link href="/" className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200 flex-shrink-0">
          <FlaskConical size={16} className="text-emerald-500" />
          BioAnalytics
        </Link>

        {/* nav links */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 overflow-x-auto">
          {NAV_LINKS.map((l) => {
            const active = pathname === l.href
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  active
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex-1 md:hidden" />

        {/* user menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 h-8 px-2">
              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 flex-shrink-0">
                {user.avatarInitials}
              </div>
              <span className="hidden sm:inline text-xs font-medium text-slate-700 dark:text-slate-300 max-w-24 truncate">
                {user.name.split(" ")[0]}
              </span>
              <Badge className={`text-xs h-5 hidden sm:flex ${ROLE_COLORS[user.role]}`}>
                {ROLE_LABELS[user.role]}
              </Badge>
              <ChevronDown size={12} className="text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="font-normal">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <Badge className={`text-xs h-5 ${ROLE_COLORS[user.role]}`}>
                    {ROLE_LABELS[user.role]}
                  </Badge>
                  <span className="text-xs text-slate-400">{user.department}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-slate-400 font-normal flex items-center gap-1">
              <ShieldCheck size={12} />
              Permissões ativas
            </DropdownMenuLabel>
            <div className="px-2 pb-1 grid grid-cols-2 gap-x-3 gap-y-0.5">
              {(Object.entries(perms) as [string, boolean][])
                .filter(([, v]) => v)
                .slice(0, 6)
                .map(([perm]) => (
                  <p key={perm} className="text-xs text-emerald-600 dark:text-emerald-400 truncate">
                    ✓ {perm.replace(/_/g, " ")}
                  </p>
                ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="gap-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              <LogOut size={14} />
              Sair da conta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  )
}
