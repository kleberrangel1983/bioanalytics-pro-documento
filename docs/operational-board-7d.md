# Board executável (sprint curta de 7 dias)

## Objetivo da sprint
Validar modelo multiagente com 3 entregas pequenas e mensuráveis:
1. Confirmação de consulta por WhatsApp (sem orientação clínica automática).
2. Log de auditoria de ações críticas.
3. Filtro de CRM para operação da secretária.

## Regras de operação (gate obrigatório para TODO PR)
- PR separado por agente e por tema.
- Escopo pequeno, reversível, sem migração destrutiva.
- Checklist LGPD: consentimento, trilha de auditoria, permissões por perfil.
- 4 comandos obrigatórios antes do merge:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - `npm run build`

---

## Ordem de merge (5 PRs sequenciais)

### PR-01 — Agente de Plataforma/Qualidade
**Escopo**
- Padronizar template de PR e checklist de qualidade.
- Garantir execução local/CI dos 4 comandos obrigatórios.

**Definição de pronto (DoD)**
- Template de PR inclui segurança, LGPD, impacto operacional, rollback.
- Pipeline executa e publica status dos 4 comandos.

**Risco principal**
- Baixo (processo, sem regra clínica).

**Métrica de sucesso**
- 100% dos PRs da sprint com checklist completo.

---

### PR-02 — Agente de Comunicação (WhatsApp)
**Escopo**
- Implementar confirmação de consulta (mensagem transacional).
- Registrar data/hora, origem, responsável e status de envio.
- Incluir opção de falar com atendente.

**Definição de pronto (DoD)**
- Fluxo não envia diagnóstico/conteúdo clínico sensível.
- Logs mínimos de envio disponíveis para auditoria.

**Risco principal**
- Médio (comunicação com paciente e LGPD).

**Métrica de sucesso**
- Redução de no-show na amostra da sprint.

---

### PR-03 — Agente de Segurança/Auditoria
**Escopo**
- Criar log de auditoria para ações críticas (ex.: editar cadastro, alterar status de agendamento).
- Registrar quem fez, quando fez, o que mudou e origem.

**Definição de pronto (DoD)**
- Evento auditável consultável por perfil autorizado.
- Sem exposição de dado sensível fora do necessário.

**Risco principal**
- Alto (integridade e rastreabilidade operacional).

**Métrica de sucesso**
- 100% das ações críticas definidas com trilha de auditoria.

---

### PR-04 — Agente de CRM/Operação
**Escopo**
- Implementar filtro de CRM para fila da secretária (ex.: status, período, origem).
- Melhorar tempo de localização de paciente/lead.

**Definição de pronto (DoD)**
- Filtros funcionam com combinação de critérios.
- Sem regressão de performance perceptível na rotina.

**Risco principal**
- Médio (impacto direto na operação diária).

**Métrica de sucesso**
- Redução do tempo médio para encontrar registros.

---

### PR-05 — Agente de Integração/Release
**Escopo**
- Consolidar documentação final da sprint.
- Publicar relatório comparativo: baseline vs pós-sprint.
- Definir backlog da sprint seguinte (somente itens de maior impacto).

**Definição de pronto (DoD)**
- Relatório com métricas: tempo até merge, bugs pós-merge, impacto operacional.
- Plano de rollback por entrega.

**Risco principal**
- Baixo (governança e fechamento).

**Métrica de sucesso**
- Decisão objetiva de continuar/ajustar o modelo multiagente.

---

## Como testar esse modelo na prática (7 dias)

## Dia 1
- Alinhar escopo e baseline operacional.
- Medir baseline:
  - tempo atual de merge,
  - bugs pós-merge (últimas 2 semanas),
  - no-show,
  - tempo médio da secretária para localizar e atualizar registros.

## Dias 2 a 5
- Executar PR-02, PR-03 e PR-04 (um por agente, em paralelo controlado).
- Merge respeitando dependências e gate de qualidade.

## Dia 6
- Estabilização, correções pequenas e validação com usuários internos (médico + secretária).

## Dia 7
- Consolidar PR-05 com relatório final e decisão de próxima sprint.

---

## Quadro de acompanhamento (copiar e usar no dia a dia)

| ID | Agente | Entrega | Status | Bloqueio | Comandos (4/4) | Risco | Dono clínico |
|---|---|---|---|---|---|---|---|
| PR-01 | Plataforma/Qualidade | Gate de qualidade | DONE | - | 4/4 | Baixo | Coordenação |
| PR-02 | Comunicação | Confirmação WhatsApp | DONE | - | 4/4 | Médio | Secretária |
| PR-03 | Segurança/Auditoria | Log de auditoria | DONE | - | 4/4 | Alto | Médico responsável |
| PR-04 | CRM/Operação | Filtro CRM | DONE | - | 4/4 | Médio | Secretária |
| PR-05 | Integração/Release | Relatório final | DONE | Depende PR-02/03/04 | 4/4 | Baixo | Coordenação |

---

## Critérios de aceite da sprint
- 3 entregas pequenas concluídas (WhatsApp, auditoria, CRM).
- 100% dos PRs com 4 comandos executados e registrados.
- Medição comparativa com baseline:
  - tempo até merge,
  - bugs pós-merge,
  - impacto operacional na clínica.
