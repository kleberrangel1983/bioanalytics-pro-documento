import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Clock, Thermometer } from 'lucide-react'
import { MOCK_ANALYSES, MOCK_SAMPLES } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

interface Alert {
  id: string
  type: 'warning' | 'error' | 'info'
  message: string
  detail: string
}

function buildAlerts(): Alert[] {
  const alerts: Alert[] = []

  const lowViabilityAnalyses = MOCK_ANALYSES.filter(a => a.viability < 70)
  if (lowViabilityAnalyses.length > 0) {
    alerts.push({
      id: 'low-viability',
      type: 'error',
      message: `${lowViabilityAnalyses.length} análises com viabilidade abaixo de 70%`,
      detail: 'Revisar amostras comprometidas',
    })
  }

  const pendingSamples = MOCK_SAMPLES.filter(s => s.status === 'pending')
  const oldPending = pendingSamples.filter(s => {
    const age = (Date.now() - new Date(s.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    return age > 2
  })
  if (oldPending.length > 0) {
    alerts.push({
      id: 'delayed-samples',
      type: 'warning',
      message: `${oldPending.length} amostras aguardam processamento há mais de 48h`,
      detail: 'Verificar fila de laboratório',
    })
  }

  const failedSamples = MOCK_SAMPLES.filter(s => s.status === 'failed')
  if (failedSamples.length > 0) {
    alerts.push({
      id: 'failed-samples',
      type: 'error',
      message: `${failedSamples.length} amostras falharam no processamento`,
      detail: 'Necessário recoleta ou revisão',
    })
  }

  const highTempSamples = MOCK_SAMPLES.filter(s => s.storageTemp > 4 && s.status !== 'archived')
  if (highTempSamples.length > 0) {
    alerts.push({
      id: 'temp-warning',
      type: 'info',
      message: `${highTempSamples.length} amostras armazenadas acima de 4°C`,
      detail: 'Monitorar condições de armazenamento',
    })
  }

  return alerts
}

const ALERT_STYLES = {
  error: { icon: AlertTriangle, className: 'text-red-600', bgClassName: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900' },
  warning: { icon: Clock, className: 'text-yellow-600', bgClassName: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900' },
  info: { icon: Thermometer, className: 'text-blue-600', bgClassName: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900' },
}

export function AlertsPanel() {
  const alerts = buildAlerts()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          Alertas
          {alerts.length > 0 && (
            <span className="ml-auto text-xs font-normal text-muted-foreground">{alerts.length} ativo(s)</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum alerta ativo</p>
        ) : (
          alerts.map((alert) => {
            const { icon: Icon, className, bgClassName } = ALERT_STYLES[alert.type]
            return (
              <div key={alert.id} className={cn('flex items-start gap-3 rounded-lg border p-3', bgClassName)}>
                <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', className)} />
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">{alert.detail}</p>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
