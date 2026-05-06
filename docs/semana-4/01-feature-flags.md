# Semana 4 — Feature Flags & Deploy em Produção com Rollout Gradual

**Versão:** 1.0  
**Data:** 2026-05-06  
**Ambiente:** Staging → Produção

---

## Objetivo

Controlar a ativação de funcionalidades em produção de forma segura e incremental, usando feature flags com:
- **Rollout percentual** — expõe gradualmente para % da base de usuários
- **Toggles por perfil** — ativa/desativa por role independentemente do rollout global
- **Rollback instantâneo** — setar rolloutPct = 0 reverte sem novo deploy

---

## Catálogo de Flags

| Flag ID | Nome | Categoria | Prod % | Staging % |
|---|---|---|---|---|
| `novo-dashboard-analitico` | Novo Dashboard Analítico | UI | 20% | 100% |
| `triagem-ia` | Triagem por IA | Experimental | 0% | 100% |
| `agendamento-online` | Agendamento Online pelo Paciente | Rollout | 30% | 100% |
| `exportacao-pdf-avancada` | Exportação PDF Avançada | API | 100% | 100% |
| `notificacoes-whatsapp` | Notificações via WhatsApp | Rollout | 5% | 100% |
| `modo-offline` | Modo Offline (PWA) | Experimental | 0% | 0% |

---

## Estratégia de Rollout Gradual

### Fase 1 — Internal (Staging 100%)
- Habilitar flag 100% em staging
- Executar fluxo E2E da Semana 2
- Executar testes de carga da Semana 3

### Fase 2 — Canary (Produção 5%)
- Ativar em produção com rolloutPct = 5
- Usar role override para incluir time interno: `admin: true`
- Monitorar por 24–48h: taxa de erro, latência P95, logs de exceção

### Fase 3 — Progressive rollout
```
5% → 20% → 50% → 100%
(janelas de 48h entre cada etapa)
```

### Fase 4 — GA (General Availability)
- rolloutPct = 100, remover role overrides
- Arquivar flag após 2 semanas estável

---

## Regras de Avaliação

**Prioridade (maior para menor):**
1. Flag desabilitada globalmente (`enabled: false`) → sempre OFF
2. Role override explícito (`roleOverrides[role] = true/false`)
3. Rollout percentual (determinístico por hash do userId)

**Fórmula de bucket:**
```ts
const bucket = userId.charCodeAt(sum) % 100
const enabled = bucket < rolloutPct
```

---

## Role Overrides por Flag (Produção)

| Flag | Admin | Médico | Secretária | Paciente | Suporte |
|---|---|---|---|---|---|
| Novo Dashboard | ✅ forçado | — | — | — | ❌ forçado |
| Triagem por IA | — | ✅ forçado | — | — | — |
| Agendamento Online | ✅ forçado | — | — | ✅ forçado | — |
| PDF Avançado | — | — | — | ❌ forçado | ❌ forçado |

---

## Procedimento de Rollback via Flag

```bash
# Rollback instantâneo sem novo deploy:
# 1. Acessar painel /staging/flags
# 2. Localizar a flag problemática
# 3. Setar rolloutPct = 0 em produção
# 4. (opcional) Setar enabled = false para bloquear completamente

# Tempo esperado: < 30 segundos
# Impacto: zero downtime
```

---

## Execução Interativa

Acesse `/staging/flags` para:
1. Alternar entre ambiente staging/produção
2. Simular avaliação para qualquer perfil e userId
3. Visualizar matriz de visibilidade por role
4. Consultar rollout percentual por ambiente

---

## Registro de Evidência

```
Data/hora: ___________________
Executor: ___________________
Ambiente testado: [ ] Staging  [ ] Produção

Flags verificadas:
- novo-dashboard-analitico: [ ] OK  [ ] NOK
- triagem-ia:               [ ] OK  [ ] NOK
- agendamento-online:       [ ] OK  [ ] NOK
- exportacao-pdf-avancada:  [ ] OK  [ ] NOK
- notificacoes-whatsapp:    [ ] OK  [ ] NOK
- modo-offline:             [ ] OK  [ ] NOK

Rollback simulado:
- Flag testada: ___________________
- Tempo para rollback: ___________________ segundos
- Resultado: [ ] APROVADO  [ ] REPROVADO
```
