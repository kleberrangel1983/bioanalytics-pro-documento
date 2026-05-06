# Semana 2 — Fluxo Ponta-a-Ponta em Homologação

**Versão:** 1.0  
**Data:** 2026-05-06  
**Ambiente:** Staging (sem dados reais)  
**Responsável:** Squad de Produto

---

## Objetivo

Validar que o fluxo completo **captação → triagem → agendamento → confirmação → log** funciona de ponta a ponta no ambiente de homologação, usando apenas dados fictícios, sem qualquer dado pessoal real (LGPD).

---

## Dados Mock do Cenário

| Campo | Valor |
|---|---|
| Paciente ID | `PAT-STAGING-001` |
| Nome | João Teste da Silva |
| CPF | 000.000.000-00 |
| E-mail | joao.teste@homologacao.local |
| Médico | Dra. Maria Homologação (CRM-HOM-99999) |
| Agendamento ID | `AGD-STAGING-001` |
| Data/hora consulta | 2026-05-10 09:00 (BRT) |

---

## Etapa 1 — Captação

**Descrição:** Registro do paciente com dados iniciais e envio de boas-vindas.

**Pré-condições:**
- Banco de staging limpo (seed de homologação aplicado)
- SMTP mock configurado (mailhog ou similar)

**Assertions:**
- [ ] Formulário aceita dados mock sem erro de validação
- [ ] Registro persiste no banco de staging com ID gerado (`PAT-STAGING-*`)
- [ ] E-mail de boas-vindas enfileirado no mock SMTP
- [ ] Status inicial do paciente = `AGUARDANDO_TRIAGEM`

**Critério de aceite:** Todas as 4 assertions verdes.

---

## Etapa 2 — Triagem

**Descrição:** Médico classifica o paciente por nível de risco clínico.

**Pré-condições:** Etapa 1 concluída.

**Assertions:**
- [ ] Médico visualiza fila de triagem do paciente no painel
- [ ] Score de risco calculado corretamente (mock: nível VERDE)
- [ ] Status do paciente atualizado para `EM_TRIAGEM`
- [ ] Evento de triagem registrado no prontuário eletrônico

**Critério de aceite:** Todas as 4 assertions verdes.

---

## Etapa 3 — Agendamento

**Descrição:** Criação de consulta associando paciente ao médico disponível.

**Pré-condições:** Etapa 2 concluída.

**Assertions:**
- [ ] API de agenda retorna slot disponível para o médico
- [ ] Agendamento criado sem conflito de horário (`AGD-STAGING-*`)
- [ ] Notificação (push/e-mail mock) enfileirada para paciente e médico
- [ ] Agenda do médico reflete o novo horário corretamente

**Critério de aceite:** Todas as 4 assertions verdes.

---

## Etapa 4 — Confirmação

**Descrição:** Paciente ou secretária confirma presença na consulta.

**Pré-condições:** Etapa 3 concluída.

**Assertions:**
- [ ] Link de confirmação válido (token mock não expirado)
- [ ] Status muda de `AGENDADO` → `CONFIRMADO` após ação
- [ ] Secretária recebe notificação de confirmação no painel
- [ ] Tentativa de realocar slot `CONFIRMADO` é rejeitada (HTTP 409)

**Critério de aceite:** Todas as 4 assertions verdes.

---

## Etapa 5 — Log de Auditoria

**Descrição:** Verificar que todas as operações anteriores estão registradas e imutáveis.

**Pré-condições:** Etapas 1–4 concluídas.

**Assertions:**
- [ ] 5 eventos no log (um por etapa do fluxo)
- [ ] Cada evento contém `user_id`, `timestamp` e `payload` completo
- [ ] Tentativa de edição de log rejeitada (403 Forbidden)
- [ ] Admin consegue exportar relatório de auditoria em CSV

**Critério de aceite:** Todas as 4 assertions verdes.

---

## Execução Interativa

Acesse `/staging` na aplicação para executar o fluxo de forma interativa com feedback visual em tempo real.

---

## Registro de Evidência

```
Run ID: ___________________
Data/hora início: ___________________
Data/hora fim: ___________________
Executor: ___________________
Resultado: [ ] APROVADO  [ ] REPROVADO
Etapas com falha: ___________________
Observações: ___________________
```
