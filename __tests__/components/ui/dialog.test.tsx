import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

// ─── Dialog ───────────────────────────────────────────────────────────────────

function BasicDialog({ showCloseButton = true }: { showCloseButton?: boolean }) {
  return (
    <Dialog>
      <DialogTrigger>Open dialog</DialogTrigger>
      <DialogContent showCloseButton={showCloseButton}>
        <DialogHeader>
          <DialogTitle>My Dialog</DialogTitle>
          <DialogDescription>This is the dialog description.</DialogDescription>
        </DialogHeader>
        <p>Dialog body content</p>
        <DialogFooter>
          <DialogClose>Dismiss</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

describe('Dialog', () => {
  it('renders the trigger button', () => {
    render(<BasicDialog />)
    expect(screen.getByText('Open dialog')).toBeInTheDocument()
  })

  it('does not show content before trigger is clicked', () => {
    render(<BasicDialog />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows dialog content when trigger is clicked', async () => {
    render(<BasicDialog />)
    await userEvent.click(screen.getByText('Open dialog'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('My Dialog')).toBeInTheDocument()
    expect(screen.getByText('This is the dialog description.')).toBeInTheDocument()
  })

  it('has data-state="open" when open', async () => {
    render(<BasicDialog />)
    await userEvent.click(screen.getByText('Open dialog'))
    expect(document.querySelector('[data-slot="dialog-content"]')).toHaveAttribute('data-state', 'open')
  })

  it('has data-slot="dialog-content"', async () => {
    render(<BasicDialog />)
    await userEvent.click(screen.getByText('Open dialog'))
    expect(document.querySelector('[data-slot="dialog-content"]')).toBeInTheDocument()
  })

  it('closes when DialogClose button is clicked', async () => {
    render(<BasicDialog />)
    await userEvent.click(screen.getByText('Open dialog'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Dismiss'))
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
  })

  it('closes when Escape key is pressed', async () => {
    render(<BasicDialog />)
    await userEvent.click(screen.getByText('Open dialog'))
    await userEvent.keyboard('{Escape}')
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
  })

  it('does not show close button when showCloseButton=false', async () => {
    render(<BasicDialog showCloseButton={false} />)
    await userEvent.click(screen.getByText('Open dialog'))
    // The icon X button is identified by its sr-only label; the footer Dismiss button remains
    expect(
      document.querySelector('[data-slot="dialog-close"] .sr-only'),
    ).not.toBeInTheDocument()
  })
})

// ─── Sheet ────────────────────────────────────────────────────────────────────

function BasicSheet({ side }: { side?: 'top' | 'right' | 'bottom' | 'left' }) {
  return (
    <Sheet>
      <SheetTrigger>Open sheet</SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>Sheet Title</SheetTitle>
          <SheetDescription>Sheet description here.</SheetDescription>
        </SheetHeader>
        <p>Sheet body</p>
      </SheetContent>
    </Sheet>
  )
}

describe('Sheet', () => {
  it('renders the trigger', () => {
    render(<BasicSheet />)
    expect(screen.getByText('Open sheet')).toBeInTheDocument()
  })

  it('shows sheet content when trigger is clicked', async () => {
    render(<BasicSheet />)
    await userEvent.click(screen.getByText('Open sheet'))
    expect(screen.getByText('Sheet Title')).toBeInTheDocument()
    expect(screen.getByText('Sheet body')).toBeInTheDocument()
  })

  it('has role="dialog" when open', async () => {
    render(<BasicSheet />)
    await userEvent.click(screen.getByText('Open sheet'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes on Escape', async () => {
    render(<BasicSheet />)
    await userEvent.click(screen.getByText('Open sheet'))
    await userEvent.keyboard('{Escape}')
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
  })

  it('renders all side variants without crashing', async () => {
    const sides = ['top', 'right', 'bottom', 'left'] as const
    for (const side of sides) {
      const { unmount } = render(<BasicSheet side={side} />)
      await userEvent.click(screen.getByText('Open sheet'))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      await userEvent.keyboard('{Escape}')
      unmount()
    }
  })

  it('has data-slot="sheet-content"', async () => {
    render(<BasicSheet />)
    await userEvent.click(screen.getByText('Open sheet'))
    expect(document.querySelector('[data-slot="sheet-content"]')).toBeInTheDocument()
  })
})

// ─── DropdownMenu ─────────────────────────────────────────────────────────────

function BasicDropdown({ onSelect }: { onSelect?: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onSelect}>Edit</DropdownMenuItem>
        <DropdownMenuItem>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

describe('DropdownMenu', () => {
  it('renders the trigger', () => {
    render(<BasicDropdown />)
    expect(screen.getByText('Open menu')).toBeInTheDocument()
  })

  it('shows menu items when trigger is clicked', async () => {
    render(<BasicDropdown />)
    await userEvent.click(screen.getByText('Open menu'))
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('has role="menu" when open', async () => {
    render(<BasicDropdown />)
    await userEvent.click(screen.getByText('Open menu'))
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('renders menu items with role="menuitem"', async () => {
    render(<BasicDropdown />)
    await userEvent.click(screen.getByText('Open menu'))
    expect(screen.getAllByRole('menuitem')).toHaveLength(2)
  })

  it('calls onSelect when a menu item is clicked', async () => {
    const onSelect = vi.fn()
    render(<BasicDropdown onSelect={onSelect} />)
    await userEvent.click(screen.getByText('Open menu'))
    await userEvent.click(screen.getByText('Edit'))
    expect(onSelect).toHaveBeenCalledOnce()
  })

  it('closes after selecting an item', async () => {
    render(<BasicDropdown />)
    await userEvent.click(screen.getByText('Open menu'))
    await userEvent.click(screen.getByText('Edit'))
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    )
  })
})
