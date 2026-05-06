# Semana 3 — Testes de Carga e Monitoramento de Latência

**Versão:** 1.0  
**Data:** 2026-05-06  
**Ambiente:** Staging  
**Ferramenta:** Simulação client-side (Recharts) · Referência: k6, Artillery

---

## Objetivo

Validar que o sistema BioAnalytics Pro suporta os níveis de carga esperados em produção, identificar gargalos de latência e garantir que os SLAs de performance estão sendo cumpridos antes do go-live.

---

## Cenários de Teste

### 1. Smoke (5 VUs · 30s)
**Propósito:** Confirmar que o ambiente está funcional com carga mínima.  
**SLA:** P95 < 800ms · Erros < 1% · Mín. 2 RPS

### 2. Carga Normal (50 VUs · 120s)
**Propósito:** Simular o volume típico de horário de pico diário.  
**SLA:** P95 < 1.000ms · Erros < 1% · Mín. 20 RPS

### 3. Pico de Acesso (200 VUs · 90s)
**Propósito:** Simular evento de pico repentino (ex.: inicio de turno hospitalar).  
**Ramp-up:** 10 segundos  
**SLA:** P95 < 2.000ms · Erros < 2% · Mín. 60 RPS

### 4. Stress (500 VUs · 120s)
**Propósito:** Identificar ponto de ruptura e comportamento sob carga extrema.  
**Ramp-up:** 30 segundos  
**SLA:** P95 < 3.000ms · Erros < 5% · Mín. 100 RPS

---

## Endpoints Testados

| Endpoint | Método | Distribuição | Descrição |
|---|---|---|---|
| `/api/patients` | GET | 30% | Listar pacientes |
| `/api/appointments` | GET | 25% | Listar agendamentos |
| `/api/appointments` | POST | 20% | Criar agendamento |
| `/api/triage` | POST | 15% | Triagem |
| `/api/logs` | GET | 10% | Logs de auditoria |

---

## Métricas Monitoradas

| Métrica | Descrição | Alerta |
|---|---|---|
| **P50** | Latência mediana | > 500ms |
| **P95** | 95% das requisições abaixo deste valor | Varia por cenário |
| **P99** | 99% das requisições | > 2x P95 |
| **RPS** | Requisições por segundo (throughput) | < mínimo do cenário |
| **Taxa de Erros** | % de respostas 4xx/5xx | > threshold do cenário |
| **Usuários Ativos** | Virtual users concorrentes | — |

---

## Execução Interativa

Acesse `/staging/carga` para:
1. Selecionar o cenário desejado
2. Visualizar gráficos de latência (P50/P95/P99) em tempo real
3. Acompanhar throughput e usuários ativos
4. Consultar resultado por endpoint
5. Verificar violações de SLA ao final

---

## Procedimento de Execução Manual (k6)

```bash
# Instalar k6
brew install k6   # macOS
# ou: https://k6.io/docs/getting-started/installation/

# Executar cenário de carga
k6 run --vus 50 --duration 120s scripts/load-test.js

# Executar cenário de pico com ramp-up
k6 run scripts/load-test-spike.js
```

---

## Critérios de Aprovação

| Cenário | Critério |
|---|---|
| Smoke | Todos os endpoints respondem sem erro |
| Carga Normal | P95 < 1s e erros < 1% durante toda a duração |
| Pico | Sistema recupera latência após ramp-up; erros < 2% |
| Stress | Sistema não crasha; responde com 503 gracioso quando sobrecarregado |

---

## Registro de Evidência

```
Run ID: ___________________
Cenário: ___________________
Data/hora início: ___________________
Data/hora fim: ___________________
Executor: ___________________

Métricas Gerais:
- Total de requisições: ___________________
- Peak RPS: ___________________
- P95 médio: ___________________ ms
- Taxa de erros: ___________________ %

Violações de SLA: [ ] Nenhuma  [ ] N= ___
Endpoints reprovados: ___________________

Resultado: [ ] APROVADO  [ ] REPROVADO
Observações: ___________________
```
