import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { KPIMetric } from '@/lib/types'

interface KPICardProps {
  metric: KPIMetric
}

export function KPICard({ metric }: KPICardProps) {
  const isUp = metric.trend === 'up'
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {metric.label}
        </CardTitle>
        {isUp ? (
          <TrendingUp className="h-4 w-4 text-green-500" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-500" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {metric.value}
          {metric.unit && <span className="text-sm font-normal text-muted-foreground ml-1">{metric.unit}</span>}
        </div>
        <p className={cn('text-xs mt-1 flex items-center gap-1', isUp ? 'text-green-600' : 'text-red-600')}>
          {isUp ? '+' : ''}{metric.delta}%
          <span className="text-muted-foreground">em relação ao mês anterior</span>
        </p>
      </CardContent>
    </Card>
  )
}
