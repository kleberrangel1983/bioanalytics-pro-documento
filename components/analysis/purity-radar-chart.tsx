'use client'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const data = [
  { parameter: 'DNA', atual: 92, referencia: 95 },
  { parameter: 'RNA', atual: 87, referencia: 90 },
  { parameter: 'Proteína', atual: 78, referencia: 85 },
  { parameter: 'Lipídio', atual: 94, referencia: 88 },
  { parameter: 'Carboidrato', atual: 82, referencia: 80 },
  { parameter: 'pH', atual: 88, referencia: 90 },
]

const chartConfig = {
  atual: { label: 'Atual', color: 'hsl(var(--chart-1))' },
  referencia: { label: 'Referência', color: 'hsl(var(--chart-2))' },
}

export function PurityRadarChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Composição e Pureza</CardTitle>
        <CardDescription>Parâmetros de pureza vs valores de referência</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px]">
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="parameter" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
            <Radar name="Atual" dataKey="atual" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} />
            <Radar name="Referência" dataKey="referencia" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.1} />
            <ChartTooltip content={<ChartTooltipContent />} />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
