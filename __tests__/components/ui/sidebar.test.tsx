import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  useSidebar,
} from '@/components/ui/sidebar'

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(() => false),
}))

beforeEach(() => {
  // Reset document.cookie between tests
  Object.defineProperty(document, 'cookie', {
    writable: true,
    configurable: true,
    value: '',
  })
})

function DesktopSidebarTree({
  defaultOpen = true,
  onOpenChange,
}: {
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  return (
    <SidebarProvider defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <Sidebar>
        <SidebarContent>
          <p>Sidebar content</p>
        </SidebarContent>
      </Sidebar>
      <main>
        <SidebarTrigger />
        <p>Page content</p>
      </main>
    </SidebarProvider>
  )
}

function StateDisplay() {
  const { state, open } = useSidebar()
  return (
    <div>
      <span data-testid="state">{state}</span>
      <span data-testid="open">{String(open)}</span>
    </div>
  )
}

describe('SidebarProvider', () => {
  it('renders children', () => {
    render(<DesktopSidebarTree />)
    expect(screen.getByText('Page content')).toBeInTheDocument()
    expect(screen.getByText('Sidebar content')).toBeInTheDocument()
  })

  it('starts in expanded state by default', () => {
    render(
      <SidebarProvider>
        <StateDisplay />
      </SidebarProvider>,
    )
    expect(screen.getByTestId('state').textContent).toBe('expanded')
    expect(screen.getByTestId('open').textContent).toBe('true')
  })

  it('starts in collapsed state when defaultOpen=false', () => {
    render(
      <SidebarProvider defaultOpen={false}>
        <StateDisplay />
      </SidebarProvider>,
    )
    expect(screen.getByTestId('state').textContent).toBe('collapsed')
    expect(screen.getByTestId('open').textContent).toBe('false')
  })

  it('has data-slot="sidebar-wrapper"', () => {
    render(<SidebarProvider><div /></SidebarProvider>)
    expect(document.querySelector('[data-slot="sidebar-wrapper"]')).toBeInTheDocument()
  })
})

describe('SidebarTrigger', () => {
  it('renders a button to toggle the sidebar', () => {
    render(<DesktopSidebarTree />)
    expect(screen.getByRole('button', { name: 'Toggle Sidebar' })).toBeInTheDocument()
  })

  it('collapses an expanded sidebar when clicked', async () => {
    render(
      <SidebarProvider defaultOpen={true}>
        <StateDisplay />
        <SidebarTrigger />
      </SidebarProvider>,
    )
    expect(screen.getByTestId('state').textContent).toBe('expanded')

    await userEvent.click(screen.getByRole('button', { name: 'Toggle Sidebar' }))

    expect(screen.getByTestId('state').textContent).toBe('collapsed')
  })

  it('expands a collapsed sidebar when clicked', async () => {
    render(
      <SidebarProvider defaultOpen={false}>
        <StateDisplay />
        <SidebarTrigger />
      </SidebarProvider>,
    )
    expect(screen.getByTestId('state').textContent).toBe('collapsed')

    await userEvent.click(screen.getByRole('button', { name: 'Toggle Sidebar' }))

    expect(screen.getByTestId('state').textContent).toBe('expanded')
  })

  it('calls the onOpenChange callback when toggled', async () => {
    const onOpenChange = vi.fn()
    render(
      <SidebarProvider defaultOpen={true} onOpenChange={onOpenChange}>
        <SidebarTrigger />
      </SidebarProvider>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Toggle Sidebar' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

describe('keyboard shortcut', () => {
  it('toggles sidebar with Ctrl+B', () => {
    render(
      <SidebarProvider defaultOpen={true}>
        <StateDisplay />
      </SidebarProvider>,
    )
    expect(screen.getByTestId('state').textContent).toBe('expanded')

    fireEvent.keyDown(window, { key: 'b', ctrlKey: true })

    expect(screen.getByTestId('state').textContent).toBe('collapsed')
  })

  it('toggles sidebar with Meta+B (Cmd+B on Mac)', () => {
    render(
      <SidebarProvider defaultOpen={true}>
        <StateDisplay />
      </SidebarProvider>,
    )

    fireEvent.keyDown(window, { key: 'b', metaKey: true })

    expect(screen.getByTestId('state').textContent).toBe('collapsed')
  })

  it('does not toggle on other key combinations', () => {
    render(
      <SidebarProvider defaultOpen={true}>
        <StateDisplay />
      </SidebarProvider>,
    )

    fireEvent.keyDown(window, { key: 'b' })

    expect(screen.getByTestId('state').textContent).toBe('expanded')
  })
})

describe('useSidebar', () => {
  it('throws when used outside SidebarProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<StateDisplay />)).toThrow(
      'useSidebar must be used within a SidebarProvider.',
    )
    consoleSpy.mockRestore()
  })
})

describe('Sidebar', () => {
  it('renders without a collapsible when collapsible="none"', () => {
    render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <p>Fixed sidebar</p>
        </Sidebar>
      </SidebarProvider>,
    )
    expect(screen.getByText('Fixed sidebar')).toBeInTheDocument()
  })

  it('has data-slot="sidebar" attribute', () => {
    render(<DesktopSidebarTree />)
    expect(document.querySelector('[data-slot="sidebar"]')).toBeInTheDocument()
  })

  it('reflects data-state="expanded" when open', () => {
    render(<DesktopSidebarTree defaultOpen={true} />)
    const sidebar = document.querySelector('[data-slot="sidebar"]')
    expect(sidebar).toHaveAttribute('data-state', 'expanded')
  })

  it('reflects data-state="collapsed" when closed', () => {
    render(<DesktopSidebarTree defaultOpen={false} />)
    const sidebar = document.querySelector('[data-slot="sidebar"]')
    expect(sidebar).toHaveAttribute('data-state', 'collapsed')
  })
})
