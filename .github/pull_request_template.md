## Resumo
- O que mudou
- Por que mudou
- Impacto operacional esperado (clínica)

## Checklist obrigatório (PR-01)
- [ ] Escopo pequeno e reversível
- [ ] Sem alteração destrutiva de dados
- [ ] Sem exposição de segredo/token/credencial
- [ ] LGPD revisada (consentimento, acesso por perfil, rastreabilidade)
- [ ] Plano de rollback descrito

## Evidências de qualidade (obrigatório)
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test`
- [ ] `npm run build`

## Segurança e LGPD
- Base legal/consentimento impactado? (sim/não)
- Perfis impactados (admin/médico/secretária/financeiro/paciente/suporte)
- Logs/auditoria afetados? (sim/não)

## Rollback
- Como desfazer rapidamente em caso de falha.
