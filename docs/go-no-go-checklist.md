# Go/No-Go Checklist de Produção

Checklist objetivo para decisão de entrada em produção do produto.

## 1) Qualidade de código
- [ ] `npm run lint` executa em toda a aplicação (não apenas testes).
- [ ] `npm run typecheck` sem erros.
- [ ] `npm run test` cobrindo fluxos críticos ponta-a-ponta.
- [ ] `npm run build` concluído com sucesso.

## 2) Segurança e conformidade
- [ ] Segregação de perfis validada (admin, médico, secretária, paciente, suporte).
- [ ] Logs de auditoria habilitados para ações sensíveis.
- [ ] Política de retenção e anonimização de dados definida.
- [ ] Procedimentos LGPD documentados (base legal, direitos do titular, resposta a incidente).

## 3) Operação clínica
- [ ] Fluxo de confirmação (ex.: WhatsApp) validado em homologação real.
- [ ] Plano de contingência para indisponibilidade de integração externa.
- [ ] Treinamento curto da equipe operacional concluído.
- [ ] Runbook com responsáveis e escalonamento publicado.

## 4) Métricas e observabilidade
- [ ] Baseline pré-go-live registrado (no-show, tempo de atendimento, lead time de incidentes).
- [ ] Dashboard mínimo de produção com alarmes de erro e latência.
- [ ] Critérios de sucesso para 7 e 30 dias definidos.
- [ ] Processo de revisão semanal das métricas definido.

## 5) Resiliência e continuidade
- [ ] Backup e restauração testados com evidência.
- [ ] Rollback técnico testado em ambiente de homologação.
- [ ] Simulação de incidente crítico executada.
- [ ] Janela de go-live e janela de hypercare definidas.

## Critério de decisão
**Go**: todos os itens críticos (qualidade, segurança, operação e rollback) concluídos.

**No-Go**: qualquer falha em segurança, segregação de dados, fluxos críticos ou plano de rollback.
