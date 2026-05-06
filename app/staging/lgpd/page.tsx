"use client"

import { useState, useMemo } from "react"
import { CheckCircle2, XCircle, MinusCircle, Clock, ChevronLeft, AlertTriangle, ShieldCheck, Lock, Eye, FileText, Trash2, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// ─── types ────────────────────────────────────────────────────────────────────

type LGPDPrinciple =
  | "finalidade" | "adequacao" | "necessidade" | "livre_acesso"
  | "qualidade" | "transparencia" | "seguranca" | "prevencao"
  | "nao_discriminacao" | "responsabilizacao"

type ItemStatus = "ok" | "fail" | "pending" | "na"

interface LGPDItem {
  id: string
  principle: LGPDPrinciple
  article: string
  label: string
  description: string
  critical: boolean
  status: ItemStatus
  risco?: string
}

// ─── data ─────────────────────────────────────────────────────────────────────

const PRINCIPLE_META: Record<LGPDPrinciple, { label: string; icon: React.ReactNode; color: string }> = {
  finalidade:          { label: "Finalidade",           icon: <FileText size={13} />,   color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  adequacao:           { label: "Adequação",            icon: <CheckCircle2 size={13} />, color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" },
  necessidade:         { label: "Necessidade",          icon: <MinusCircle size={13} />, color: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200" },
  livre_acesso:        { label: "Livre Acesso",         icon: <Eye size={13} />,        color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200" },
  qualidade:           { label: "Qualidade",            icon: <UserCheck size={13} />,  color: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200" },
  transparencia:       { label: "Transparência",        icon: <Eye size={13} />,        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  seguranca:           { label: "Segurança",            icon: <Lock size={13} />,       color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
  prevencao:           { label: "Prevenção",            icon: <AlertTriangle size={13} />, color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  nao_discriminacao:   { label: "Não Discriminação",    icon: <ShieldCheck size={13} />, color: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200" },
  responsabilizacao:   { label: "Responsabilização",    icon: <FileText size={13} />,   color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
}

const INITIAL_ITEMS: LGPDItem[] = [
  // Finalidade
  { id: "fin-1", principle: "finalidade", article: "Art. 6º I", label: "Propósito do tratamento documentado", description: "Existe documento formal descrevendo a finalidade de cada dado coletado (nome, CPF, histórico clínico).", critical: true, status: "pending" },
  { id: "fin-2", principle: "finalidade", article: "Art. 6º I", label: "Dados usados apenas para fins declarados", description: "Dados de pacientes não são usados para fins além dos declarados no consentimento (ex.: marketing).", critical: true, status: "pending", risco: "Uso de dados clínicos para análise comercial sem consentimento." },
  // Adequação
  { id: "ade-1", principle: "adequacao", article: "Art. 6º II", label: "Compatibilidade com finalidade declarada", description: "Todos os campos coletados são compatíveis com a prestação do serviço de saúde.", critical: false, status: "pending" },
  // Necessidade
  { id: "nec-1", principle: "necessidade", article: "Art. 6º III", label: "Coleta mínima de dados (data minimization)", description: "Nenhum dado além do estritamente necessário é coletado. Ex.: CPF e telefone coletados, RG não.", critical: true, status: "pending" },
  { id: "nec-2", principle: "necessidade", article: "Art. 6º III", label: "Staging sem dados reais confirmado", description: "Verificado que o ambiente de staging contém apenas dados fictícios (PAT-STAGING-*).", critical: true, status: "pending" },
  // Livre Acesso
  { id: "lac-1", principle: "livre_acesso", article: "Art. 6º IV / Art. 18", label: "Portal de acesso do titular implementado", description: "Paciente consegue acessar, corrigir e solicitar exclusão dos próprios dados via portal.", critical: true, status: "pending", risco: "Ausência de mecanismo de acesso pode configurar violação do Art. 18." },
  { id: "lac-2", principle: "livre_acesso", article: "Art. 18 VI", label: "Prazo de resposta ≤ 15 dias configurado", description: "SLA de resposta a solicitações de titulares definido e monitorado.", critical: true, status: "pending" },
  // Qualidade
  { id: "qua-1", principle: "qualidade", article: "Art. 6º V", label: "Processo de correção de dados disponível", description: "Secretária ou admin pode corrigir dados cadastrais do paciente sem dependência de suporte técnico.", critical: false, status: "pending" },
  // Transparência
  { id: "tra-1", principle: "transparencia", article: "Art. 6º VI / Art. 9º", label: "Política de Privacidade publicada", description: "Política de Privacidade acessível antes do cadastro, em linguagem clara, com informações do encarregado (DPO).", critical: true, status: "pending" },
  { id: "tra-2", principle: "transparencia", article: "Art. 9º", label: "Consentimento explícito coletado", description: "Checkbox de consentimento específico por finalidade na captação do paciente (Semana 2).", critical: true, status: "pending", risco: "Consentimento genérico ou opt-out não é aceito pela LGPD para dados de saúde." },
  // Segurança
  { id: "seg-1", principle: "seguranca", article: "Art. 46", label: "Criptografia de dados sensíveis em repouso", description: "Dados clínicos e CPF criptografados no banco de dados (AES-256 ou equivalente).", critical: true, status: "pending" },
  { id: "seg-2", principle: "seguranca", article: "Art. 46", label: "TLS 1.2+ em todas as conexões", description: "HTTPS forçado. Sem downgrade para HTTP em nenhum endpoint.", critical: true, status: "pending" },
  { id: "seg-3", principle: "seguranca", article: "Art. 46", label: "Controle de acesso por perfil (RBAC)", description: "Confirmado pela matriz de perfis (Semana 2): paciente não acessa dados de outros pacientes.", critical: true, status: "pending" },
  { id: "seg-4", principle: "seguranca", article: "Art. 46", label: "Logs de auditoria imutáveis", description: "Toda ação sobre dados pessoais registrada com timestamp, userId e payload. Edição de log retorna 403.", critical: true, status: "pending" },
  // Prevenção
  { id: "pre-1", principle: "prevencao", article: "Art. 6º VIII", label: "Plano de resposta a incidentes documentado", description: "Runbook de incidente (Semana 2) cobre violação de dados: notificação à ANPD em 72h e comunicação aos titulares.", critical: true, status: "pending", risco: "Art. 48 exige comunicação à ANPD em prazo razoável após incidente." },
  { id: "pre-2", principle: "prevencao", article: "Art. 6º VIII", label: "DPIA realizado para dados de saúde", description: "Relatório de Impacto à Proteção de Dados Pessoais elaborado — dados de saúde são sensíveis (Art. 11).", critical: true, status: "pending" },
  // Não discriminação
  { id: "ndi-1", principle: "nao_discriminacao", article: "Art. 6º IX", label: "Dados não usados para fins discriminatórios", description: "Nenhum campo clínico usado para negar serviço, calcular preço diferenciado ou qualquer discriminação.", critical: true, status: "pending" },
  // Responsabilização
  { id: "res-1", principle: "responsabilizacao", article: "Art. 6º X / Art. 41", label: "Encarregado (DPO) nomeado", description: "Nome e contato do DPO publicados na Política de Privacidade e registrados na ANPD.", critical: true, status: "pending" },
  { id: "res-2", principle: "responsabilizacao", article: "Art. 37", label: "Registro de atividades de tratamento", description: "Mapa de dados (data map) atualizado com todos os tratamentos, bases legais e retenção.", critical: true, status: "pending" },
  { id: "res-3", principle: "responsabilizacao", article: "Art. 46", label: "Política de retenção e descarte definida", description: "Prazo máximo de retenção definido por tipo de dado. Processo de descarte seguro documentado.", critical: false, status: "pending" },
]

const STATUS_CYCLE: ItemStatus[] = ["pending", "ok", "fail", "na"]
const STATUS_ICON: Record<ItemStatus, React.ReactNode> = {
  pending: <Clock size={17} className="text-slate-300 dark:text-slate-600" />,
  ok:      <CheckCircle2 size={17} className="text-emerald-500" />,
  fail:    <XCircle size={17} className="text-red-500" />,
  na:      <MinusCircle size={17} className="text-slate-400" />,
}
const STATUS_LABEL: Record<ItemStatus, string> = { pending: "Pendente", ok: "OK", fail: "Falhou", na: "N/A" }

// ─── component ────────────────────────────────────────────────────────────────

export default function LGPDPage() {
  const [items, setItems] = useState<LGPDItem[]>(INITIAL_ITEMS)

  const cycleStatus = (id: string) => {
    setItems((prev) => prev.map((item) => {
      if (item.id !== id) return item
      const idx = STATUS_CYCLE.indexOf(item.status)
      return { ...item, status: STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length] }
    }))
  }

  const criticalItems = useMemo(() => items.filter((i) => i.critical), [items])
  const doneCritical = useMemo(() => criticalItems.filter((i) => i.status === "ok" || i.status === "na").length, [criticalItems])
  const blockers = useMemo(() => items.filter((i) => i.critical && i.status === "fail"), [items])
  const approved = useMemo(() => criticalItems.every((i) => i.status === "ok" || i.status === "na"), [criticalItems])
  const progress = Math.round((doneCritical / criticalItems.length) * 100)

  const principles = Object.keys(PRINCIPLE_META) as LGPDPrinciple[]

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <a href="/staging" className="flex items-center gap-1"><ChevronLeft size={16} /> Voltar</a>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Lock size={22} /> Segurança & Compliance LGPD
          </h1>
          <p className="text-slate-500 text-sm">
            Semana 5 — Camada 3 · 10 princípios · {items.length} controles · {criticalItems.length} críticos
          </p>
        </div>
        {approved
          ? <Badge className="bg-emerald-500 text-white gap-1"><ShieldCheck size={13} /> Conforme</Badge>
          : blockers.length > 0
          ? <Badge variant="destructive" className="gap-1"><AlertTriangle size={13} /> {blockers.length} não-conforme{blockers.length > 1 ? "s" : ""}</Badge>
          : <Badge variant="secondary">Em revisão</Badge>}
      </div>

      {/* progress */}
      <section className="space-y-1.5">
        <div className="flex justify-between text-sm text-slate-500">
          <span>{doneCritical}/{criticalItems.length} controles críticos verificados</span>
          <span className="font-mono">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </section>

      {/* blockers */}
      {blockers.length > 0 && (
        <section className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 p-4 space-y-2">
          <p className="font-semibold text-red-800 dark:text-red-200 flex items-center gap-2">
            <AlertTriangle size={16} /> Não conformidades críticas (blocker de go-live)
          </p>
          <ul className="space-y-1.5">
            {blockers.map((b) => (
              <li key={b.id} className="text-sm text-red-700 dark:text-red-300 space-y-0.5">
                <div className="flex items-center gap-2">
                  <XCircle size={13} className="flex-shrink-0" />
                  <span className="font-medium">{b.label}</span>
                  <span className="text-xs text-red-500 font-mono">{b.article}</span>
                </div>
                {b.risco && <p className="ml-5 text-xs text-red-600 dark:text-red-400">⚠ {b.risco}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* controls by principle */}
      {principles.map((principle) => {
        const pItems = items.filter((i) => i.principle === principle)
        if (pItems.length === 0) return null
        const { label, icon, color } = PRINCIPLE_META[principle]
        const done = pItems.filter((i) => i.status === "ok" || i.status === "na").length
        return (
          <section key={principle} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${color}`}>
                {icon} {label}
              </span>
              <span className="text-xs text-slate-400">{done}/{pItems.length}</span>
            </div>
            <div className="space-y-2">
              {pItems.map((item) => (
                <div key={item.id}
                  className={`rounded-lg border p-3.5 flex items-start gap-3 transition-colors ${
                    item.status === "ok"   ? "border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20"
                    : item.status === "fail" ? "border-red-200 dark:border-red-900 bg-red-50/40 dark:bg-red-950/20"
                    : item.status === "na"   ? "border-slate-100 dark:border-slate-800 opacity-60"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  }`}>
                  <button onClick={() => cycleStatus(item.id)} className="flex-shrink-0 mt-0.5 hover:scale-110 transition-transform" title={STATUS_LABEL[item.status]}>
                    {STATUS_ICON[item.status]}
                  </button>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-medium ${item.status === "ok" ? "text-emerald-700 dark:text-emerald-300" : item.status === "fail" ? "text-red-700 dark:text-red-300" : "text-slate-700 dark:text-slate-300"}`}>
                        {item.label}
                      </p>
                      <span className="text-xs font-mono text-slate-400">{item.article}</span>
                      {item.critical && item.status !== "ok" && item.status !== "na" && (
                        <Badge variant="outline" className="text-xs text-red-600 border-red-300 dark:border-red-700">crítico</Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{item.description}</p>
                    {item.risco && item.status !== "ok" && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <AlertTriangle size={11} /> {item.risco}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      })}

      {/* approval stamp */}
      {approved && (
        <section className="rounded-lg border-2 border-emerald-400 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950 p-6 text-center space-y-2">
          <ShieldCheck size={40} className="text-emerald-500 mx-auto" />
          <p className="text-xl font-bold text-emerald-800 dark:text-emerald-200">Conformidade LGPD verificada</p>
          <p className="text-xs text-emerald-500 font-mono">{doneCritical}/{criticalItems.length} controles críticos · {items.filter((i) => i.status === "ok").length} OK · {items.filter((i) => i.status === "na").length} N/A</p>
        </section>
      )}

      {/* legend */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
        <span>Clique no ícone para alternar:</span>
        {STATUS_CYCLE.map((s) => (
          <span key={s} className="flex items-center gap-1">{STATUS_ICON[s]} {STATUS_LABEL[s]}</span>
        ))}
      </div>
    </main>
  )
}
