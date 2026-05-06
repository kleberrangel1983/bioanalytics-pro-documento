# Relatório de fechamento — Sprint curta (7 dias)

## Escopo consolidado
- PR-01: gate de qualidade + template de PR.
- PR-02: núcleo de confirmação WhatsApp (transacional, sem conteúdo clínico) + contrato de auditoria.
- PR-03: núcleo de log de auditoria para ações críticas.
- PR-04: núcleo de filtro CRM por clínica/status/origem/período.
- PR-05: fechamento com relatório e decisão da próxima sprint.

## Baseline vs pós-sprint (preencher com dados da operação)
| Métrica | Baseline (antes) | Pós-sprint (depois) | Variação | Observação |
|---|---:|---:|---:|---|
| Tempo até merge (h) | _preencher_ | _preencher_ | _preencher_ | Medir da abertura ao merge |
| Bugs pós-merge (qtde/7 dias) | _preencher_ | _preencher_ | _preencher_ | Considerar incidentes reais |
| No-show (%) | _preencher_ | _preencher_ | _preencher_ | Impacto de confirmação WhatsApp |
| Tempo da secretária para localizar lead (min) | _preencher_ | _preencher_ | _preencher_ | Impacto do filtro CRM |

## Evidências técnicas da sprint
- Qualidade padronizada no fluxo: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`.
- Board operacional com PR-01 a PR-04 concluídos.
- PR-05 registra fechamento e governança para próximo ciclo.

## Riscos residuais
- Lint ainda com escopo reduzido (tests JS), não cobre toda app TS/TSX.
- Testes atuais validam contratos de utilitários; falta cobertura de fluxo de interface.
- Integrações externas (WhatsApp provider real) ainda não implementadas neste ciclo.

## Decisão recomendada para próxima sprint
1. Ampliar lint para TS/TSX da aplicação.
2. Cobrir fluxo de interface (secretária) com testes de comportamento.
3. Conectar confirmação WhatsApp a provider real em homologação (sem dados reais de paciente).
4. Definir painel simples de auditoria para consulta por perfil autorizado.

## Plano de rollback
- Cada PR foi mantido pequeno e reversível.
- Reversão por PR via `git revert <sha>` em caso de regressão.


## PR-06 (ciclo seguinte)
- Entrega: guarda de separação por clínica em `lib/tenant-access.ts` para evitar acesso cruzado entre clínicas.
- Motivação: reforçar LGPD e segurança por tenant antes de evoluir integrações externas.

## PR-07 (ciclo seguinte)
- Entrega: matriz de permissões por perfil em `lib/access-policy.ts` para reforçar segregação (médico/secretária/paciente/suporte).
- Motivação: reduzir risco LGPD e risco de erro operacional antes de fluxos clínicos mais complexos.

## PR-08 (ciclo seguinte)
- Entrega: utilitário de assinatura e validação de webhook em `lib/webhook-security.ts` (HMAC SHA-256 + comparação segura).
- Motivação: reduzir risco de chamadas externas forjadas em integrações futuras (ex.: WhatsApp provider).

## PR-09 (ciclo seguinte)
- Entrega: filtro de consulta de auditoria por perfil em `lib/audit-log.ts` (admin/médico veem; suporte recebe metadata mascarada; demais sem acesso).
- Motivação: habilitar painel de auditoria com menor risco de exposição indevida.

## PR-10 (ciclo seguinte)
- Entrega: utilitário de trilha de consentimento LGPD em `lib/consent-log.ts` (granted/revoked, canal, finalidade, ator e timestamp).
- Motivação: aumentar rastreabilidade e controle de base legal antes de integrações em produção.

## PR-11 (ciclo seguinte)
- Entrega: utilitário de política de backup em `lib/backup-policy.ts` (frequência, retenção, criptografia, trilha de ator).
- Motivação: reduzir risco operacional e LGPD relacionado a perda de dados e ausência de política mínima.

## PR-12 (ciclo seguinte)
- Entrega: utilitário de janela de envio de lembrete em `lib/reminder-window.ts` com metadata de auditoria.
- Motivação: reduzir no-show com regra simples, rastreável e reversível de disparo.

## PR-13 (ciclo seguinte)
- Entrega: utilitário de rate limit de mensagens em `lib/message-rate-limit.ts` (janela por minutos e limite por paciente/canal).
- Motivação: reduzir risco de spam e desgaste de comunicação com paciente.

## PR-14 (ciclo seguinte)
- Entrega: política de transição de status de agendamento em `lib/appointment-status-policy.ts`.
- Motivação: evitar mudanças inválidas de estado e reduzir retrabalho operacional da secretária.

## PR-15 (ciclo seguinte)
- Entrega: utilitário de chave de idempotência em `lib/idempotency.ts` para evitar envio/registro duplicado.
- Motivação: reduzir retrabalho, mensagens duplicadas e inconsistência operacional.

## PR-16 (ciclo seguinte)
- Entrega: utilitário de registro de incidente em `lib/incident-log.ts` (severidade, origem, responsável e timestamp).
- Motivação: acelerar resposta operacional e rastrear eventos críticos de forma consistente.

## PR-17 (ciclo seguinte)
- Entrega: política de retry com backoff em `lib/retry-policy.ts` para falhas transitórias de integração.
- Motivação: reduzir falha intermitente sem gerar tempestade de requisições.

## PR-18 (ciclo seguinte)
- Entrega: utilitário de retenção de dados em `lib/data-retention.ts` para identificar itens expirados com política mínima segura.
- Motivação: reduzir risco de retenção indevida e apoiar governança LGPD.

## PR-19 (ciclo seguinte)
- Entrega: utilitário de alerta de incidente de privacidade em `lib/privacy-alert.ts`.
- Motivação: melhorar tempo de resposta e critério de escalonamento em risco LGPD.

## PR-20 (ciclo seguinte)
- Entrega: guarda de persistência de rascunho clínico em `lib/clinical-draft-guard.ts` (exige revisão médica ativa).
- Motivação: reforçar segurança clínica e evitar uso automático de conteúdo não revisado.
