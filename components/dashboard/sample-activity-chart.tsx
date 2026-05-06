'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { MONTHLY_SAMPLE_VOLUME } from '@/lib/mock-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ChartConfig } from '@/components/ui/chart'

const chartConfig: ChartConfig = {
  blood: { label: 'Sangue', color: 'hsl(var(--chart-1))' },
  tissue: { label: 'Tecido', color: 'hsl(var(--chart-2))' },
  urine: { label: 'Urina', color: 'hsl(var(--chart-3))' },
  saliva: { label: 'Saliva', color: 'hsl(var(--chart-4))' },
  csf: { label: 'LCR', color: 'hsl(var(--chart-5))' },
  biopsy: { label: 'Biópsia', color: 'hsl(220 70% 50%)' },
}

export function SampleActivityChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Volume de Amostras</CardTitle>
        <CardDescription>Distribuição mensal por tipo (últimos 12 meses)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart data={MONTHLY_SAMPLE_VOLUME} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="blood" stackId="a" fill="var(--color-blood)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="tissue" stackId="a" fill="var(--color-tissue)" />
            <Bar dataKey="urine" stackId="a" fill="var(--color-urine)" />
            <Bar dataKey="saliva" stackId="a" fill="var(--color-saliva)" />
            <Bar dataKey="csf" stackId="a" fill="var(--color-csf)" />
            <Bar dataKey="biopsy" stackId="a" fill="var(--color-biopsy)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
