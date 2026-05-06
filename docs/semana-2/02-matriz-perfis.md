# Semana 2 — Matriz de Perfis de Acesso

**Versão:** 1.0  
**Data:** 2026-05-06  
**Ambiente:** Staging

---

## Perfis Testados

| Perfil | Descrição |
|---|---|
| **Admin** | Acesso total ao sistema |
| **Médico** | Acesso clínico — visualiza e edita pacientes, triagem, relatórios |
| **Secretária** | Acesso operacional — agenda, confirmação |
| **Paciente** | Acesso restrito — apenas próprios agendamentos |
| **Suporte** | Acesso de diagnóstico — logs e relatórios, sem dados clínicos |

---

## Matriz de Permissões

### Pacientes

| Permissão | Admin | Médico | Secretária | Paciente | Suporte |
|---|:---:|:---:|:---:|:---:|:---:|
| Ver pacientes | ✅ | ✅ | ✅ | ❌ | ❌ |
| Editar pacientes | ✅ | ✅ | ❌ | ❌ | ❌ |
| Triar paciente | ✅ | ✅ | ❌ | ❌ | ❌ |

### Agenda

| Permissão | Admin | Médico | Secretária | Paciente | Suporte |
|---|:---:|:---:|:---:|:---:|:---:|
| Criar agendamento | ✅ | ❌ | ✅ | ❌ | ❌ |
| Cancelar agendamento | ✅ | ✅ | ✅ | ❌ | ❌ |
| Confirmar agendamento | ✅ | ❌ | ✅ | ❌ | ❌ |
| Ver próprios agendamentos | ✅ | ✅ | ✅ | ✅ | ❌ |

### Sistema

| Permissão | Admin | Médico | Secretária | Paciente | Suporte |
|---|:---:|:---:|:---:|:---:|:---:|
| Ver logs de auditoria | ✅ | ❌ | ❌ | ❌ | ✅ |
| Exportar dados | ✅ | ❌ | ❌ | ❌ | ❌ |
| Gerenciar usuários | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ver relatórios | ✅ | ✅ | ❌ | ❌ | ✅ |

---

## Cenários de Teste por Perfil

### Admin
1. Login com credencial `admin@homologacao.local / staging-test-123`
2. Executar todas as ações do fluxo completo
3. Acessar painel de logs e exportar CSV
4. Criar/desativar usuário de teste

### Médico
1. Login com `medico@homologacao.local / staging-test-123`
2. Visualizar fila de triagem → classificar paciente mock
3. Tentar criar agendamento → **esperado: 403 Forbidden**
4. Acessar relatórios de atendimento

### Secretária
1. Login com `secretaria@homologacao.local / staging-test-123`
2. Criar agendamento para paciente mock com médico mock
3. Confirmar agendamento
4. Tentar editar prontuário → **esperado: 403 Forbidden**

### Paciente
1. Login com `paciente@homologacao.local / staging-test-123`
2. Visualizar próprios agendamentos
3. Tentar acessar `/admin` ou `/logs` → **esperado: 403 ou redirect**
4. Confirmar/cancelar próprio agendamento via link

### Suporte
1. Login com `suporte@homologacao.local / staging-test-123`
2. Acessar logs de auditoria (somente leitura)
3. Visualizar relatórios de sistema
4. Tentar editar qualquer registro clínico → **esperado: 403 Forbidden**

---

## Execução Interativa

Acesse `/staging/perfis` na aplicação para visualizar a matriz completa com status de cada verificação.

---

## Registro de Evidência

```
Data/hora: ___________________
Executor: ___________________

Admin:      [ ] Aprovado  [ ] Reprovado — Obs: ___
Médico:     [ ] Aprovado  [ ] Reprovado — Obs: ___
Secretária: [ ] Aprovado  [ ] Reprovado — Obs: ___
Paciente:   [ ] Aprovado  [ ] Reprovado — Obs: ___
Suporte:    [ ] Aprovado  [ ] Reprovado — Obs: ___

Resultado geral: [ ] APROVADO  [ ] REPROVADO
```
