# BioAnalytics Pro — Guia do Projeto

## Visão Geral

Plataforma de análise de dados biológicos e biomédicos construída com Next.js 16, React 19 e TypeScript 5.7. O projeto utiliza Shadcn/UI (Radix UI) como design system, Tailwind CSS v4 para estilização e Recharts para visualizações de dados.

## Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16.2 (App Router) |
| UI | React 19 + TypeScript 5.7 strict |
| Estilo | Tailwind CSS v4 + oklch color tokens |
| Componentes | Shadcn/UI (Radix UI primitives) |
| Gráficos | Recharts 2.15 |
| Formulários | React Hook Form + Zod |
| Temas | next-themes (light/dark/system) |
| Testes | Vitest 4 + Testing Library + jsdom |
| Deploy | Vercel (com Analytics) |

## Comandos Essenciais

```bash
pnpm dev           # Servidor de desenvolvimento (http://localhost:3000)
pnpm build         # Build de produção (TypeScript verificado)
pnpm test          # Rodar todos os testes (vitest run)
pnpm test:watch    # Testes em modo watch
pnpm test:coverage # Relatório de cobertura (html + text)
pnpm lint          # ESLint
```

## Estrutura de Arquivos

```
app/
  layout.tsx        # Layout raiz: ThemeProvider + metadata + fontes Geist
  page.tsx          # Home page — dashboard principal
  globals.css       # Tokens de design (oklch) + Tailwind base

components/
  ui/               # 56+ componentes Shadcn/UI (NÃO editar manualmente)
  theme-provider.tsx # Wrapper do next-themes

hooks/
  use-toast.ts      # Sistema de toasts (reducer + listener pattern)
  use-mobile.ts     # Breakpoint mobile (768px)

lib/
  utils.ts          # cn() — merge de classes Tailwind (clsx + tailwind-merge)

__tests__/
  hooks/            # Testes unitários dos hooks
  components/ui/    # Testes dos componentes UI
  lib/              # Testes de utilitários
```

## Arquitetura de Componentes

### Componentes UI (`components/ui/`)
Gerados e mantidos via [Shadcn/UI](https://ui.shadcn.com). **Não edite diretamente** — use o CLI `npx shadcn@latest add <componente>` para adicionar ou atualizar.

Componentes principais disponíveis:
- **Layout**: Sidebar, Separator, ScrollArea, ResizablePanelGroup
- **Formulários**: Form, Field, Input, InputGroup, Select, Checkbox, RadioGroup, Switch, Slider, InputOTP, Calendar
- **Feedback**: Toast/Toaster, Sonner, Progress, Alert, Spinner, Empty
- **Overlay**: Dialog, Sheet, Drawer, AlertDialog, Popover, Tooltip, HoverCard, DropdownMenu, ContextMenu, Command
- **Dados**: Table, ChartContainer (Recharts wrapper), Badge, Avatar, Item, ItemGroup
- **Navegação**: Tabs, Accordion, Collapsible, NavigationMenu, Menubar, Pagination, Breadcrumb
- **Tipografia**: Card, Kbd, Label, FieldLabel, FieldDescription

### Padrão de className
Sempre use `cn()` de `@/lib/utils` para compor classes:
```typescript
import { cn } from '@/lib/utils'
className={cn('base-classes', conditional && 'conditional-class', className)}
```

### Tema (dark mode)
O `ThemeProvider` em `app/layout.tsx` gerencia light/dark/system via `next-themes`. Use classes `.dark:` do Tailwind para variantes escuras. Tokens CSS em `app/globals.css`.

## Testes

### Executar testes específicos
```bash
pnpm test -- __tests__/components/ui/button.test.tsx
pnpm test -- --reporter=verbose
```

### Cobertura atual
- **Statements**: ~74% | **Branches**: ~64% | **Functions**: ~65% | **Lines**: ~74%

### Mocks necessários no jsdom
Configurados em `vitest.setup.ts`:
- `ResizeObserver` — Embla Carousel, Radix Slider
- `IntersectionObserver` — Embla Carousel slide-in-view
- `window.matchMedia` — Embla Carousel breakpoints, useIsMobile
- `Element.prototype.scrollIntoView` — cmdk Command

### Padrões de teste importantes
- **Toasts**: Use `vi.useFakeTimers()` + `vi.advanceTimersByTime(1000001)` + `dismiss()` no `afterEach` para limpar estado global
- **Dialogs**: Radix não define `aria-modal` em jsdom; cheque `data-state="open"` em vez disso
- **Collapsible fechado**: Radix remove o conteúdo do DOM; use `not.toBeInTheDocument()`
- **Separator decorative**: Por padrão tem `role="none"`; query por `[data-slot="separator"]`

## Variáveis de Ambiente

Nenhuma variável de ambiente obrigatória para desenvolvimento local. Em produção, o Vercel Analytics é ativado automaticamente via `NODE_ENV === 'production'`.

## Convenções

- Imports com alias `@/` mapeado para a raiz do projeto
- Componentes server-side por padrão; use `'use client'` apenas quando necessário
- TypeScript strict — sem `any` implícito, sem `ignoreBuildErrors`
- Commits em português ou inglês; mensagens descrevem o *porquê*, não o *o quê*
