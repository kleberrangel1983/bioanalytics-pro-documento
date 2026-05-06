'use client'

import { usePathname } from 'next/navigation'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { ThemeToggle } from './theme-toggle'
import { UserNav } from './user-nav'

function getBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  if (pathname === '/dashboard') return [{ label: 'Dashboard' }]
  if (pathname === '/samples') return [{ label: 'Laboratório' }, { label: 'Amostras' }]
  if (pathname.startsWith('/samples/')) return [
    { label: 'Laboratório' },
    { label: 'Amostras', href: '/samples' },
    { label: 'Detalhe' },
  ]
  if (pathname === '/analysis') return [{ label: 'Laboratório' }, { label: 'Análises' }]
  if (pathname === '/reports') return [{ label: 'Documentação' }, { label: 'Relatórios' }]
  if (pathname.startsWith('/reports/')) return [
    { label: 'Documentação' },
    { label: 'Relatórios', href: '/reports' },
    { label: 'Detalhe' },
  ]
  if (pathname === '/settings') return [{ label: 'Sistema' }, { label: 'Configurações' }]
  return [{ label: 'BioAnalytics Pro' }]
}

export function AppHeader({ title: _title }: { title: string }) {
  const pathname = usePathname()
  const crumbs = getBreadcrumbs(pathname)

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb className="flex-1">
        <BreadcrumbList>
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1
            return (
              <span key={crumb.label} className="inline-flex items-center gap-1.5">
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : crumb.href ? (
                    <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                  ) : (
                    <span className="text-muted-foreground text-sm">{crumb.label}</span>
                  )}
                </BreadcrumbItem>
              </span>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  )
}
