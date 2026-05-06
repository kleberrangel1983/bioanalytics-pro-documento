# Revisão rápida da base de código (06/05/2026)

## Diagnóstico
A base segue enxuta (layout + componentes de UI), mas já recebeu duas correções estruturais para reduzir risco de manutenção:
1) existe agora `app/page.tsx`, eliminando referência quebrada de onboarding;
2) o hook `useIsMobile` ficou com uma única fonte de verdade em `hooks/use-mobile.ts`.

## Correções aplicadas neste ciclo

### 1) Erro de referência/"digitação" no onboarding (corrigido)
- **Antes:** README orientava editar `app/page.tsx`, mas o arquivo não existia.
- **Agora:** `app/page.tsx` foi criado com uma página inicial mínima.
- **Impacto:** reduz fricção para quem inicia o projeto.

### 2) Bug de manutenção por duplicação de hook (corrigido)
- **Antes:** havia duas implementações de `useIsMobile` (`hooks/use-mobile.ts` e `components/ui/use-mobile.tsx`).
- **Agora:** arquivo duplicado foi removido e a base usa apenas `hooks/use-mobile.ts`.
- **Impacto:** evita divergência de comportamento entre cópias.

## Pendências recomendadas

### 3) Discrepância de documentação (médio)
- **Problema atual:** não há seção clara no README com comandos de qualidade realmente suportados.
- **Próxima tarefa:** documentar explicitamente scripts disponíveis e ausentes (`lint`/`build` existem; `typecheck`/`test` não existem hoje).

### 4) Melhoria de testes (alto)
- **Problema atual:** não há suíte de testes automatizados.
- **Próxima tarefa:** adicionar testes unitários para `useIsMobile` (largura `< 768`, `>= 768`, e reação ao evento `matchMedia` `change`).

## Observação de validação
- `npm run lint` falhou por ausência de configuração do ESLint v9 (`eslint.config.*` não encontrado).
- `npm run build` falhou por dependência externa de rede (download de fontes Google Geist/Geist Mono via `fonts.googleapis.com`).
