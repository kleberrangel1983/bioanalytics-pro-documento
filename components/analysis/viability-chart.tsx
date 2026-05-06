'use client'

import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { VIABILITY_TREND } from '@/lib/mock-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ChartConfig } from '@/components/ui/chart'

const chartConfig: ChartConfig = {
  viability: { label: 'Viabilidade (%)', color: 'hsl(var(--chart-2))' },
}

export function ViabilityChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendência de Viabilidade</CardTitle>
        <CardDescription>Viabilidade celular média nos últimos 30 dias (threshold: 70%)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={VIABILITY_TREND} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="viabilityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} interval={4} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} domain={[40, 100]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ReferenceLine y={70} stroke="hsl(var(--destructive))" strokeDasharray="4 4" label={{ value: '70%', position: 'right', fontSize: 11 }} />
            <Area type="monotone" dataKey="viability" stroke="hsl(var(--chart-2))" fill="url(#viabilityGradient)" strokeWidth={2} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
