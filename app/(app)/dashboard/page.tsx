import { KPICard } from '@/components/dashboard/kpi-card'
import { SampleActivityChart } from '@/components/dashboard/sample-activity-chart'
import { AnalysisOverviewChart } from '@/components/dashboard/analysis-overview-chart'
import { RecentSamplesTable } from '@/components/dashboard/recent-samples-table'
import { AlertsPanel } from '@/components/dashboard/alerts-panel'
import { getKPIs } from '@/lib/mock-data'

export default function DashboardPage() {
  const kpis = getKPIs()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do laboratório de bioanalítica</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((metric) => (
          <KPICard key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SampleActivityChart />
        </div>
        <div>
          <AlertsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AnalysisOverviewChart />
        <RecentSamplesTable />
      </div>
    </div>
  )
}
