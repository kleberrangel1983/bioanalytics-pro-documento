/**
 * Extra tests to push coverage on theme-provider, Empty component,
 * and deeper menubar/context-menu variants (checkbox, radio, submenu).
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// ─── ThemeProvider ────────────────────────────────────────────────────────────
import { ThemeProvider } from '@/components/theme-provider'

describe('ThemeProvider', () => {
  it('renders children', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="light">
        <div data-testid="child">hello</div>
      </ThemeProvider>,
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('renders without crashing with system default theme', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <p>content</p>
      </ThemeProvider>,
    )
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('renders without crashing in dark mode', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <span>dark content</span>
      </ThemeProvider>,
    )
    expect(screen.getByText('dark content')).toBeInTheDocument()
  })
})

// ─── Empty ────────────────────────────────────────────────────────────────────
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty'

describe('Empty', () => {
  it('renders empty container', () => {
    render(<Empty data-testid="empty-root" />)
    expect(screen.getByTestId('empty-root')).toBeInTheDocument()
  })

  it('renders title and description', () => {
    render(
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No results found</EmptyTitle>
          <EmptyDescription>Try adjusting your search filters.</EmptyDescription>
        </EmptyHeader>
      </Empty>,
    )
    expect(screen.getByText('No results found')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your search filters.')).toBeInTheDocument()
  })

  it('renders media section', () => {
    render(
      <Empty>
        <EmptyMedia>
          <img src="empty.svg" alt="empty state" />
        </EmptyMedia>
      </Empty>,
    )
    expect(screen.getByAltText('empty state')).toBeInTheDocument()
  })

  it('renders content section with action', () => {
    render(
      <Empty>
        <EmptyContent>
          <button>Create new</button>
        </EmptyContent>
      </Empty>,
    )
    expect(screen.getByRole('button', { name: 'Create new' })).toBeInTheDocument()
  })

  it('renders full empty state composition', () => {
    render(
      <Empty>
        <EmptyMedia>
          <div data-testid="icon" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>Empty inbox</EmptyTitle>
          <EmptyDescription>No messages yet.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <button>Compose message</button>
        </EmptyContent>
      </Empty>,
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('Empty inbox')).toBeInTheDocument()
    expect(screen.getByText('No messages yet.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Compose message' })).toBeInTheDocument()
  })
})

// ─── Menubar — checkbox, radio, sub-menu ─────────────────────────────────────
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  MenubarSeparator,
  MenubarShortcut,
} from '@/components/ui/menubar'

describe('Menubar advanced items', () => {
  it('renders a checkbox menu item', async () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem checked>Show toolbar</MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    )
    await userEvent.click(screen.getByText('View'))
    await waitFor(() =>
      expect(screen.getByRole('menuitemcheckbox')).toBeInTheDocument(),
    )
    expect(screen.getByRole('menuitemcheckbox')).toHaveAttribute('aria-checked', 'true')
  })

  it('renders a radio group in menubar', async () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Format</MenubarTrigger>
          <MenubarContent>
            <MenubarRadioGroup value="left">
              <MenubarRadioItem value="left">Left</MenubarRadioItem>
              <MenubarRadioItem value="center">Center</MenubarRadioItem>
              <MenubarRadioItem value="right">Right</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    )
    await userEvent.click(screen.getByText('Format'))
    await waitFor(() =>
      expect(screen.getAllByRole('menuitemradio')).toHaveLength(3),
    )
  })

  it('renders item with keyboard shortcut', async () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              Copy <MenubarShortcut>⌘C</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    )
    await userEvent.click(screen.getByText('Edit'))
    await waitFor(() =>
      expect(screen.getByText('⌘C')).toBeInTheDocument(),
    )
  })

  it('renders menubar separator', async () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Exit</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    )
    await userEvent.click(screen.getByText('File'))
    await waitFor(() =>
      expect(screen.getByRole('separator')).toBeInTheDocument(),
    )
  })

  it('renders sub-trigger for nested menu', async () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Insert</MenubarTrigger>
          <MenubarContent>
            <MenubarSub>
              <MenubarSubTrigger>More tools</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Screenshot</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    )
    await userEvent.click(screen.getByText('Insert'))
    await waitFor(() =>
      expect(screen.getByText('More tools')).toBeInTheDocument(),
    )
    expect(
      document.querySelector('[data-slot="menubar-sub-trigger"]'),
    ).toBeInTheDocument()
  })
})

// ─── ContextMenu — radio group and sub-menu ───────────────────────────────────
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuSeparator,
} from '@/components/ui/context-menu'

describe('ContextMenu advanced items', () => {
  it('renders a radio group', async () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger data-testid="trigger">right-click</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuRadioGroup value="view1">
            <ContextMenuRadioItem value="view1">View 1</ContextMenuRadioItem>
            <ContextMenuRadioItem value="view2">View 2</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>,
    )
    fireEvent.contextMenu(screen.getByTestId('trigger'))
    await waitFor(() =>
      expect(screen.getAllByRole('menuitemradio')).toHaveLength(2),
    )
    expect(screen.getByRole('menuitemradio', { name: 'View 1' })).toHaveAttribute('aria-checked', 'true')
  })

  it('renders a sub-menu trigger', async () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger data-testid="trigger">right-click</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuSub>
            <ContextMenuSubTrigger>More options</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>Option A</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>,
    )
    fireEvent.contextMenu(screen.getByTestId('trigger'))
    await waitFor(() =>
      expect(screen.getByText('More options')).toBeInTheDocument(),
    )
    expect(
      document.querySelector('[data-slot="context-menu-sub-trigger"]'),
    ).toBeInTheDocument()
  })

  it('renders a separator in context menu', async () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger data-testid="trigger">right-click</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Cut</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>Paste</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    )
    fireEvent.contextMenu(screen.getByTestId('trigger'))
    await waitFor(() =>
      expect(screen.getByRole('separator')).toBeInTheDocument(),
    )
  })
})
