'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, BarChart3, FlaskConical, Settings, Users } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'

const navItems = [
  { icon: BarChart3,   label: 'Dashboard',    href: '/' },
  { icon: FlaskConical, label: 'Análises',     href: '/analyses' },
  { icon: Activity,    label: 'Monitoramento', href: '/monitoring' },
  { icon: Users,       label: 'Equipe',        href: '/team' },
  { icon: Settings,    label: 'Configurações', href: '/settings' },
]

export function AppShell({
  children,
  title,
}: {
  children: React.ReactNode
  title: string
}) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <FlaskConical className="size-6 text-primary" />
            <span className="font-semibold text-sm">BioAnalytics Pro</span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarImage src="/placeholder-user.jpg" alt="Usuário" />
              <AvatarFallback>BP</AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-xs min-w-0">
              <span className="font-medium truncate">Bio Admin</span>
              <span className="text-muted-foreground truncate">admin@bioanalytics.pro</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <h1 className="font-semibold">{title}</h1>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 space-y-6 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
