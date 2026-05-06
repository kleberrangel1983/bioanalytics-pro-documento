# BioAnalytics Pro

Plataforma avançada de monitoramento clínico — Biomonitoramento & Análise de Dados.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript 5.7**
- **Tailwind CSS v4** · paleta de marca navy/gold/teal
- **shadcn/ui** (componentes Radix UI)
- **Vitest** + **@testing-library/react** para testes

## Estrutura

```
app/
├── page.tsx                  # Home — hero da marca + navegação
├── not-found.tsx             # Página 404 com identidade visual
└── staging/                  # Ambiente de homologação (Semana 2)
    ├── page.tsx              # Dashboard de validação E2E
    ├── perfis/page.tsx       # Matriz de permissões por perfil
    └── rollback/page.tsx     # Runbook de incidente & rollback

components/
├── brand-logo.tsx            # Logotipo + wordmark da marca
├── back-button.tsx           # Botão "Voltar" (client component)
└── theme-provider.tsx        # Provedor de tema dark/light

lib/staging/
├── types.ts                  # Tipos: FlowStep, UserRole, Permission…
└── mock-data.ts              # Dados mock, permissões por role, runbook

public/
├── logo-bioanalytics.webp    # Logo principal (79 KB, WebP)
└── logo-bioanalytics.png     # Fallback PNG (776 KB)
```

## Início rápido

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

## Scripts disponíveis

| Comando        | O que faz                              |
|----------------|----------------------------------------|
| `pnpm dev`     | Servidor de desenvolvimento            |
| `pnpm build`   | Build de produção (TS errors quebram)  |
| `pnpm test`    | Testes em modo watch                   |
| `pnpm test:ci` | Testes em modo CI (run once)           |
| `pnpm lint`    | ESLint (flat config, TS-eslint)        |

## Validação de Homologação — Semana 2

O ambiente `/staging` implementa três painéis de validação manual:

### 1. Fluxo E2E (`/staging`)
Simula o ciclo completo de atendimento:
`Captação → Triagem → Agendamento → Confirmação → Log de Auditoria`

- Cada etapa executa 4 asserções com feedback em tempo real
- **Modo Falha**: toggle que injeta erros realistas por etapa (ex: timeout de banco, conflito de agenda, token expirado)
- O status final reflete o resultado real da execução

### 2. Matriz de Perfis (`/staging/perfis`)
Verifica as permissões de cada role contra a política de acesso:

| Role       | Permissões-chave                        |
|------------|-----------------------------------------|
| admin      | Todas (11/11)                           |
| medico     | Ver/editar pacientes, triar, relatórios |
| secretaria | Criar/confirmar agendamentos            |
| paciente   | Somente ver próprios agendamentos       |
| suporte    | Logs e relatórios (somente leitura)     |

### 3. Runbook de Rollback (`/staging/rollback`)
Simula incidente P1 e executa os 8 passos do runbook com SLA < 15 min.

## Testes

```bash
pnpm test:ci
# Test Files  4 passed (4)
# Tests      43 passed (43)
```

Cobertura atual:
- `hooks/use-toast.test.ts` — reducer (11 casos)
- `lib/staging/mock-data.test.ts` — permissões + createInitialReport (20 casos)
- `lib/utils.test.ts` — cn() (8 casos)
- `hooks/use-mobile.test.ts` — useIsMobile (5 casos — matchMedia mock)

## Paleta de marca

| Token             | Cor              | Uso                     |
|-------------------|------------------|-------------------------|
| `brand-navy`      | `#0D1B2A`        | Background dark (padrão)|
| `brand-gold`      | `#C9A84C`        | Primary, ring, PRO badge|
| `brand-teal`      | `#4DB8A0`        | Accent, "Bio" no wordmark|
| `brand-teal-dark` | `#1B4D5C`        | Secondary, superfícies  |
| `brand-light`     | `#E8F0FE`        | Foreground no dark      |
