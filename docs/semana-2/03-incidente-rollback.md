# Semana 2 — Procedimento de Incidente & Rollback

**Versão:** 1.0  
**Data:** 2026-05-06  
**Ambiente:** Staging  
**Incidente de referência:** `INC-STAGING-2026-W2`

---

## Cenário Simulado

**Tipo:** Serviço de Agendamento Indisponível (HTTP 503)  
**Descrição:** API de agendamento retorna 503 por mais de 2 minutos contínuos.  
**Impacto:** Nenhum agendamento pode ser criado ou confirmado. Bloqueio total do fluxo pós-triagem.

---

## SLAs de Referência

| Marco | Alvo |
|---|---|
| Detecção do incidente | < 2 minutos |
| Primeiro resposta (ack) | < 5 minutos |
| Rollback completo | < 15 minutos |
| Comunicação ao time | < 20 minutos |

---

## Runbook de Rollback — 8 Passos

### Passo 1 — Acionar alerta
```
# Slack: /incident create 'API Agendamento 503' P1
# Canal: #ops-alertas
```
Responsável: Engenheiro de plantão  
Tempo esperado: < 1 min

---

### Passo 2 — Verificar logs do serviço
```bash
vercel logs --project bioanalytics-pro --since 10m
```
Responsável: Engenheiro de plantão  
Objetivo: Identificar primeira ocorrência do erro 503 e stack trace.

---

### Passo 3 — Identificar último deploy saudável
```bash
git log --oneline -5
# anotar SHA do commit anterior ao deploy com falha
```
Responsável: Engenheiro de plantão  
Objetivo: Obter `DEPLOYMENT_ID` do último estado estável no Vercel.

---

### Passo 4 — Reverter deploy via Vercel
```bash
vercel rollback --project bioanalytics-pro <DEPLOYMENT_ID>
```
Responsável: Engenheiro sênior (requer permissão de deploy)  
Tempo esperado: 1–3 min  
Verificar: Dashboard Vercel mostra deployment anterior como "Current".

---

### Passo 5 — Validar health check pós-rollback
```bash
curl -f https://staging.bioanalytics.local/api/health
# Esperado: HTTP 200 {"status":"ok"}
```
Repetir a cada 30 segundos por 2 minutos para confirmar estabilidade.

---

### Passo 6 — Re-executar smoke test
```bash
pnpm test:staging --smoke
```
Ou acessar `/staging` e executar o fluxo ponta-a-ponta interativo.  
Critério: todos os 5 passos do fluxo devem passar.

---

### Passo 7 — Registrar RCA (Root Cause Analysis)
Criar ticket no Linear/Notion com:
- Timeline do incidente (detecção → resolução)
- Causa raiz identificada
- Ação corretiva planejada
- Tempo total de impacto

---

### Passo 8 — Comunicar resolução
```
# Slack #ops-alertas:
"✅ INC-STAGING-2026-W2 RESOLVIDO
Serviço: API Agendamento
Rollback para: <SHA>
Tempo de impacto: X min
RCA: <link>"
```
Fechar o incidente na ferramenta de on-call.

---

## Decisão de Rollback vs. Hotfix

| Situação | Decisão |
|---|---|
| Erro introduzido no último deploy | Rollback imediato (< 15 min) |
| Erro de infraestrutura/ambiente | Hotfix coordenado com DevOps |
| Erro em migração de banco | Rollback de aplicação + restaurar snapshot |
| Impacto limitado a 1 usuário | Investigar sem rollback |

---

## Execução Interativa

Acesse `/staging/rollback` na aplicação para simular o incidente passo a passo com cronômetro de SLA.

---

## Registro de Evidência

```
Incidente ID: ___________________
Data/hora detecção: ___________________
Data/hora resolução: ___________________
Tempo total: ___________________ minutos
SLA atingido: [ ] Sim  [ ] Não
Causa raiz: ___________________
Executor do rollback: ___________________
Deploy revertido (SHA): ___________________
Smoke test pós-rollback: [ ] Aprovado  [ ] Reprovado
```
