# Evidências — Semana 2 Homologação

Este diretório armazena os registros de evidência das execuções de teste.

## Estrutura esperada

```
evidencias/
├── README.md               ← este arquivo
├── run-<RUN_ID>.json       ← dump JSON do relatório de cada execução
├── perfis-<DATA>.md        ← evidência assinada do teste de perfis
└── incidente-<ID>.md       ← evidência do rollback simulado
```

## Como registrar evidência

1. Execute o fluxo em `/staging` e copie o **Run ID** gerado.
2. Preencha o template abaixo e salve como `run-<RUN_ID>.md`.
3. Repita para `/staging/perfis` e `/staging/rollback`.

## Template de evidência de run

```markdown
# Evidência de Homologação

- **Run ID:** 
- **Data/hora início:** 
- **Data/hora fim:** 
- **Executor:** 
- **Ambiente:** staging
- **Branch:** claude/test-staging-workflow-eo4qE

## Resultado do Fluxo E2E

| Etapa | Status | Duração |
|---|---|---|
| Captação | ✅ Aprovado | Xms |
| Triagem | ✅ Aprovado | Xms |
| Agendamento | ✅ Aprovado | Xms |
| Confirmação | ✅ Aprovado | Xms |
| Log de Auditoria | ✅ Aprovado | Xms |

## Resultado de Perfis

| Perfil | Status |
|---|---|
| Admin | ✅ |
| Médico | ✅ |
| Secretária | ✅ |
| Paciente | ✅ |
| Suporte | ✅ |

## Resultado do Rollback

- Tempo total: X segundos
- SLA (< 15 min): ✅ Dentro

## Assinatura

Executor: ___________________  
Data: ___________________
```
