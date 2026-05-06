'use client'

import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { MOCK_ANALYSES } from '@/lib/mock-data'
import { ANALYSIS_TYPE_CONFIG } from '@/lib/constants'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ChartConfig } from '@/components/ui/chart'
import { formatDate } from '@/lib/formatters'

const chartConfig: ChartConfig = {
  pcr: { label: 'PCR', color: 'hsl(var(--chart-1))' },
  elisa: { label: 'ELISA', color: 'hsl(var(--chart-2))' },
  'flow-cytometry': { label: 'Citometria de Fluxo', color: 'hsl(var(--chart-3))' },
  sequencing: { label: 'Sequenciamento', color: 'hsl(var(--chart-4))' },
  microscopy: { label: 'Microscopia', color: 'hsl(var(--chart-5))' },
}

export function ConcentrationChart() {
  const data = MOCK_ANALYSES
    .filter(a => a.concentration > 0)
    .sort((a, b) => new Date(a.performedAt).getTime() - new Date(b.performedAt).getTime())
    .slice(0, 40)
    .map((a, i) => ({
      index: i + 1,
      concentration: a.concentration,
      type: a.type,
      date: formatDate(a.performedAt),
    }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Concentração por Análise</CardTitle>
        <CardDescription>Concentração (mg/mL) ao longo das análises realizadas</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="index" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} domain={[0, 4]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ReferenceLine y={1.5} stroke="hsl(var(--destructive))" strokeDasharray="4 4" label={{ value: 'Threshold', position: 'right', fontSize: 11 }} />
            <Line type="monotone" dataKey="concentration" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
