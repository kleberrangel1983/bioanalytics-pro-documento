"use client";

import { useState, useEffect, useRef } from "react";

type Metric = {
  name: string;
  unit: string;
  baseline: number;
  pos: number;
  metaValue: number;
  critico: boolean;
  lowerIsBetter: boolean;
};

const initialMetrics: Metric[] = [
  {
    name: "Taxa de no-show",
    unit: "%",
    baseline: 28,
    pos: 14,
    metaValue: 15,
    critico: true,
    lowerIsBetter: true,
  },
  {
    name: "Tempo médio secretária (min/agendamento)",
    unit: " min",
    baseline: 8,
    pos: 3.2,
    metaValue: 4,
    critico: true,
    lowerIsBetter: true,
  },
  {
    name: "Bugs / incidentes por sprint",
    unit: "",
    baseline: 11,
    pos: 3,
    metaValue: 5,
    critico: true,
    lowerIsBetter: true,
  },
  {
    name: "Lead time de agendamento (dias)",
    unit: " d",
    baseline: 3.1,
    pos: 1.0,
    metaValue: 1.5,
    critico: false,
    lowerIsBetter: true,
  },
];

function computeDelta(baseline: number, pos: number): string {
  if (baseline === 0) return "—";
  const pct = ((pos - baseline) / baseline) * 100;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(0)} %`;
}

function passed(m: Metric): boolean {
  return m.lowerIsBetter ? m.pos <= m.metaValue : m.pos >= m.metaValue;
}

function EditableNumber({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [raw, setRaw] = useState(String(value));
  const prevExternal = useRef(value);

  // Sync when parent resets the value externally (not from our own onChange)
  useEffect(() => {
    if (value !== prevExternal.current) {
      prevExternal.current = value;
      setRaw(String(value));
    }
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const str = e.target.value;
    setRaw(str);
    const parsed = parseFloat(str);
    if (!isNaN(parsed)) {
      prevExternal.current = parsed;
      onChange(parsed);
    }
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      value={raw}
      onChange={handleChange}
      className="w-24 text-center border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  );
}

export default function GoNoGoPage() {
  const [metrics, setMetrics] = useState<Metric[]>(initialMetrics);

  function update(
    index: number,
    field: "baseline" | "pos" | "metaValue",
    value: number
  ) {
    setMetrics((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  }

  function metaLabel(m: Metric): string {
    const dir = m.lowerIsBetter ? "≤" : "≥";
    return `${dir} ${m.metaValue}${m.unit}`;
  }

  const allCriticalPassed = metrics
    .filter((m) => m.critico)
    .every((m) => passed(m));

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Cabeçalho */}
        <header className="space-y-1">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">
            Semana 3
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            Decidir Go / No-Go com números
          </h1>
          <p className="text-gray-600">
            Edite <strong>Baseline</strong>, <strong>Pós-piloto</strong> e{" "}
            <strong>Meta</strong> diretamente na tabela — delta e veredicto
            atualizam em tempo real. Itens críticos (★) determinam o caminho.
          </p>
        </header>

        {/* Tabela de métricas editável */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">
              1 — Métricas: Baseline vs. Pós-piloto
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
                <tr>
                  <th className="px-6 py-3 text-left">Métrica</th>
                  <th className="px-6 py-3 text-center">Baseline</th>
                  <th className="px-6 py-3 text-center">Pós-piloto</th>
                  <th className="px-6 py-3 text-center">Meta</th>
                  <th className="px-6 py-3 text-center">Delta</th>
                  <th className="px-6 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {metrics.map((m, i) => {
                  const ok = passed(m);
                  const delta = computeDelta(m.baseline, m.pos);
                  const deltaColor =
                    ok ? "text-emerald-600" : "text-red-500";
                  return (
                    <tr key={m.name} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {m.critico && (
                          <span className="text-amber-500 mr-1" title="Item crítico">
                            ★
                          </span>
                        )}
                        {m.name}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <EditableNumber
                          value={m.baseline}
                          onChange={(v) => update(i, "baseline", v)}
                        />
                        <span className="text-xs text-gray-400 ml-1">{m.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <EditableNumber
                          value={m.pos}
                          onChange={(v) => update(i, "pos", v)}
                        />
                        <span className="text-xs text-gray-400 ml-1">{m.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <EditableNumber
                          value={m.metaValue}
                          onChange={(v) => update(i, "metaValue", v)}
                        />
                        <div className="text-xs text-gray-400 mt-0.5">
                          {metaLabel(m)}
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-center font-medium ${deltaColor}`}>
                        {delta}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {ok ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                            ✓ Passou
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-red-200">
                            ✗ Falhou
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
            ★ Item crítico — falha em qualquer um destes resulta em No-Go
            automático. · Baseline, Pós-piloto e Meta são todos editáveis.
          </div>
        </section>

        {/* Veredicto — atualiza em tempo real */}
        <section
          className={`rounded-2xl border p-6 transition-colors duration-300 ${
            allCriticalPassed
              ? "bg-emerald-50 border-emerald-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-start gap-4">
            <span className="text-4xl">{allCriticalPassed ? "🟢" : "🔴"}</span>
            <div>
              <h2
                className={`text-xl font-bold ${
                  allCriticalPassed ? "text-emerald-800" : "text-red-800"
                }`}
              >
                {allCriticalPassed
                  ? "DECISÃO: GO — Go-live controlado com hypercare"
                  : "DECISÃO: NO-GO — Retornar ao ciclo de correção"}
              </h2>
              <p
                className={`mt-1 text-sm ${
                  allCriticalPassed ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {allCriticalPassed
                  ? "Todos os itens críticos passaram. Avançar para go-live com período de hypercare de 2 semanas, monitoramento diário e canal de suporte dedicado."
                  : "Um ou mais itens críticos falharam. Identificar causa-raiz, corrigir, e repetir validação antes de nova reunião de decisão."}
              </p>
            </div>
          </div>
        </section>

        {/* Reunião de decisão */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            2 — Reunião de decisão
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-red-50 border border-red-100 p-4">
              <h3 className="font-semibold text-red-800 mb-2">🔴 Caminho No-Go</h3>
              <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                <li>Qualquer item crítico (★) fora da meta</li>
                <li>Congelar release e abrir sprint de correção</li>
                <li>Rever SLA e reagendar nova reunião em 1 semana</li>
              </ul>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
              <h3 className="font-semibold text-emerald-800 mb-2">🟢 Caminho Go</h3>
              <ul className="text-sm text-emerald-700 space-y-1 list-disc list-inside">
                <li>Todos os itens críticos dentro da meta</li>
                <li>Go-live em janela de baixo tráfego (ex.: domingo noite)</li>
                <li>Hypercare de 2 semanas com squad de plantão</li>
                <li>Rollback automático se no-show subir &gt; 20% em 48 h</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Código / Configuração */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">
            5 — Código / Configuração
          </h2>
          <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
            <p className="text-sm text-blue-800 font-medium">
              Nenhuma alteração de código obrigatória neste momento para decidir o caminho.
            </p>
            <p className="text-sm text-blue-700 mt-1">
              A configuração atual já possui pipeline e scripts adequados para o
              ciclo curto com segurança mínima.
            </p>
          </div>
        </section>

        {/* Como testar */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">
            6 — Como testar (prático)
          </h2>
          <p className="text-sm text-gray-600">
            No ambiente local / homologação, rode sempre:
          </p>
          <div className="rounded-xl bg-gray-900 p-4 space-y-2">
            <pre className="text-sm text-emerald-400 font-mono">npm run lint</pre>
            <pre className="text-sm text-emerald-400 font-mono">npm run typecheck</pre>
          </div>
          <p className="text-xs text-gray-400">
            Ambos devem passar com zero erros antes de qualquer merge para{" "}
            <code className="bg-gray-100 px-1 rounded">main</code>.
          </p>
        </section>

        <footer className="text-center text-xs text-gray-400 pb-4">
          Semana 3 — BioAnalytics Pro · Documento de decisão Go / No-Go
        </footer>
      </div>
    </main>
  );
}
