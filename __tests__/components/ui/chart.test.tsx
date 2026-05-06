import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  ChartContainer,
  ChartStyle,
  ChartTooltipContent,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'

const baseConfig: ChartConfig = {
  revenue: { label: 'Revenue', color: '#3b82f6' },
  expenses: { label: 'Expenses', color: '#ef4444' },
}

const themeConfig: ChartConfig = {
  revenue: {
    label: 'Revenue',
    theme: { light: '#3b82f6', dark: '#60a5fa' },
  },
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ChartContainer config={baseConfig}>{children as any}</ChartContainer>
}

describe('ChartContainer', () => {
  it('renders with data-slot="chart"', () => {
    render(
      <ChartContainer config={baseConfig}>
        <div />
      </ChartContainer>,
    )
    expect(document.querySelector('[data-slot="chart"]')).toBeInTheDocument()
  })

  it('sets a data-chart attribute with a unique id', () => {
    render(
      <ChartContainer config={baseConfig} id="test-chart">
        <div />
      </ChartContainer>,
    )
    expect(document.querySelector('[data-chart="chart-test-chart"]')).toBeInTheDocument()
  })

  it('renders children inside the container', () => {
    render(
      <ChartContainer config={baseConfig}>
        <div data-testid="chart-child" />
      </ChartContainer>,
    )
    expect(screen.getByTestId('chart-child')).toBeInTheDocument()
  })
})

describe('ChartStyle', () => {
  it('returns null when config has no color or theme entries', () => {
    const emptyConfig: ChartConfig = { revenue: { label: 'Revenue' } }
    const { container } = render(
      <ChartStyle id="chart-1" config={emptyConfig} />,
    )
    expect(container.querySelector('style')).toBeNull()
  })

  it('renders a <style> element when config has color entries', () => {
    const { container } = render(
      <ChartStyle id="chart-1" config={baseConfig} />,
    )
    expect(container.querySelector('style')).toBeInTheDocument()
  })

  it('includes CSS variable for each color entry', () => {
    const { container } = render(
      <ChartStyle id="chart-1" config={baseConfig} />,
    )
    const styleContent = container.querySelector('style')?.innerHTML ?? ''
    expect(styleContent).toContain('--color-revenue: #3b82f6')
    expect(styleContent).toContain('--color-expenses: #ef4444')
  })

  it('includes CSS variables for both light and dark themes', () => {
    const { container } = render(
      <ChartStyle id="chart-2" config={themeConfig} />,
    )
    const styleContent = container.querySelector('style')?.innerHTML ?? ''
    expect(styleContent).toContain('--color-revenue: #3b82f6')
    expect(styleContent).toContain('--color-revenue: #60a5fa')
  })

  it('scopes CSS to the chart element by id', () => {
    const { container } = render(
      <ChartStyle id="chart-scoped" config={baseConfig} />,
    )
    const styleContent = container.querySelector('style')?.innerHTML ?? ''
    expect(styleContent).toContain('[data-chart=chart-scoped]')
  })
})

describe('ChartTooltipContent', () => {
  it('returns null when active is false', () => {
    render(
      <Wrapper>
        <ChartTooltipContent active={false} payload={[]} />
      </Wrapper>,
    )
    // Tooltip content div (identified by shadow-xl) is absent when inactive
    expect(document.querySelector('.shadow-xl')).not.toBeInTheDocument()
  })

  it('returns null when payload is empty', () => {
    render(
      <Wrapper>
        <ChartTooltipContent active={true} payload={[]} />
      </Wrapper>,
    )
    // No tooltip content when payload is empty
    expect(document.querySelector('.shadow-xl')).not.toBeInTheDocument()
  })

  it('renders tooltip content when active with payload', () => {
    const payload = [
      {
        name: 'revenue',
        dataKey: 'revenue',
        value: 1000,
        color: '#3b82f6',
        payload: { fill: '#3b82f6' },
      },
    ]
    const { container } = render(
      <Wrapper>
        <ChartTooltipContent active={true} payload={payload as any} />
      </Wrapper>,
    )
    expect(container.firstChild?.firstChild).not.toBeNull()
  })

  it('renders the formatted value', () => {
    const payload = [
      {
        name: 'revenue',
        dataKey: 'revenue',
        value: 1000,
        color: '#3b82f6',
        payload: { fill: '#3b82f6' },
      },
    ]
    render(
      <Wrapper>
        <ChartTooltipContent active={true} payload={payload as any} />
      </Wrapper>,
    )
    expect(screen.getByText('1,000')).toBeInTheDocument()
  })

  it('hides label when hideLabel=true', () => {
    const payload = [
      {
        name: 'revenue',
        dataKey: 'revenue',
        value: 500,
        color: '#3b82f6',
        payload: { fill: '#3b82f6' },
      },
    ]
    const { container } = render(
      <Wrapper>
        <ChartTooltipContent
          active={true}
          payload={payload as any}
          label="Revenue"
          hideLabel={true}
        />
      </Wrapper>,
    )
    // No label element should have the "Revenue" text
    expect(container.querySelector('.font-medium')?.textContent).not.toBe('Revenue')
  })
})

describe('ChartLegendContent', () => {
  it('returns null when payload is undefined', () => {
    render(
      <Wrapper>
        <ChartLegendContent />
      </Wrapper>,
    )
    // Legend container has both items-center and justify-center;
    // ChartContainer only has justify-center, so this selector is legend-specific.
    expect(document.querySelector('.items-center.justify-center')).not.toBeInTheDocument()
  })

  it('returns null when payload is empty', () => {
    render(
      <Wrapper>
        <ChartLegendContent payload={[]} />
      </Wrapper>,
    )
    expect(document.querySelector('.items-center.justify-center')).not.toBeInTheDocument()
  })

  it('renders a legend entry for each payload item', () => {
    const payload = [
      { value: 'revenue', dataKey: 'revenue', color: '#3b82f6' },
      { value: 'expenses', dataKey: 'expenses', color: '#ef4444' },
    ]
    render(
      <Wrapper>
        <ChartLegendContent payload={payload as any} />
      </Wrapper>,
    )
    expect(screen.getByText('Revenue')).toBeInTheDocument()
    expect(screen.getByText('Expenses')).toBeInTheDocument()
  })

  it('renders color swatches for each legend item', () => {
    const payload = [
      { value: 'revenue', dataKey: 'revenue', color: '#3b82f6' },
    ]
    const { container } = render(
      <Wrapper>
        <ChartLegendContent payload={payload as any} />
      </Wrapper>,
    )
    const swatch = container.querySelector('.h-2.w-2') as HTMLElement
    expect(swatch?.style.backgroundColor).toBe('rgb(59, 130, 246)')
  })

  it('adds pb-3 class when verticalAlign="top"', () => {
    const payload = [{ value: 'revenue', dataKey: 'revenue', color: '#3b82f6' }]
    render(
      <Wrapper>
        <ChartLegendContent payload={payload as any} verticalAlign="top" />
      </Wrapper>,
    )
    // The legend text is inside inner item div; one level up is the legend container
    const labelText = screen.getByText('Revenue')
    const legendContainer = labelText.parentElement
    expect(legendContainer?.className).toContain('pb-3')
  })
})
