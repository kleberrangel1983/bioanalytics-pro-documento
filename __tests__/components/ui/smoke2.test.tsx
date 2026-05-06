/**
 * Smoke tests — second batch.
 * Covers all UI components that still had 0% coverage after the first round.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// ─── AlertDialog ──────────────────────────────────────────────────────────────
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'

describe('AlertDialog', () => {
  it('renders the trigger', () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Delete</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    )
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('shows content after trigger is clicked', async () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    )
    await userEvent.click(screen.getByText('Open'))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()
  })

  it('closes when cancel is clicked', async () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    )
    await userEvent.click(screen.getByText('Open'))
    await userEvent.click(screen.getByText('Cancel'))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })
})

// ─── AspectRatio ──────────────────────────────────────────────────────────────
import { AspectRatio } from '@/components/ui/aspect-ratio'

describe('AspectRatio', () => {
  it('renders children inside aspect-ratio container', () => {
    render(
      <AspectRatio ratio={16 / 9}>
        <img src="test.jpg" alt="test" />
      </AspectRatio>,
    )
    expect(screen.getByAltText('test')).toBeInTheDocument()
  })
})

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

describe('Breadcrumb', () => {
  it('renders breadcrumb navigation', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Current</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Current')).toBeInTheDocument()
  })

  it('current page has aria-current="page"', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Page</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    expect(screen.getByText('Page')).toHaveAttribute('aria-current', 'page')
  })
})

// ─── Collapsible ──────────────────────────────────────────────────────────────
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible'

describe('Collapsible', () => {
  it('shows content when open', () => {
    render(
      <Collapsible open>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Hidden content</CollapsibleContent>
      </Collapsible>,
    )
    expect(screen.getByText('Hidden content')).toBeInTheDocument()
  })

  it('hides content when closed', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Hidden content</CollapsibleContent>
      </Collapsible>,
    )
    // Radix Collapsible does not mount content when closed
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument()
  })

  it('toggles open on trigger click', async () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>,
    )
    await userEvent.click(screen.getByText('Toggle'))
    expect(screen.getByText('Content')).toBeVisible()
  })
})

// ─── Command ──────────────────────────────────────────────────────────────────
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'

describe('Command', () => {
  it('renders command input and items', () => {
    render(
      <Command>
        <CommandInput placeholder="Search…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>Calendar</CommandItem>
            <CommandItem>Search</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    )
    expect(screen.getByPlaceholderText('Search…')).toBeInTheDocument()
    expect(screen.getByText('Calendar')).toBeInTheDocument()
  })

  it('filters items when typing', async () => {
    render(
      <Command>
        <CommandInput placeholder="Search…" />
        <CommandList>
          <CommandGroup>
            <CommandItem>Calendar</CommandItem>
            <CommandItem>Settings</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    )
    await userEvent.type(screen.getByPlaceholderText('Search…'), 'Cal')
    expect(screen.getByText('Calendar')).toBeInTheDocument()
    expect(screen.queryByText('Settings')).not.toBeInTheDocument()
  })
})

// ─── HoverCard ────────────────────────────────────────────────────────────────
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card'

describe('HoverCard', () => {
  it('renders trigger', () => {
    render(
      <HoverCard>
        <HoverCardTrigger>Hover me</HoverCardTrigger>
        <HoverCardContent>Card content</HoverCardContent>
      </HoverCard>,
    )
    expect(screen.getByText('Hover me')).toBeInTheDocument()
  })
})

// ─── InputOTP ─────────────────────────────────────────────────────────────────
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

describe('InputOTP', () => {
  it('renders OTP input with slots', () => {
    render(
      <InputOTP maxLength={4}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>,
    )
    expect(document.querySelector('[data-slot="input-otp"]')).toBeInTheDocument()
  })
})

// ─── Kbd ──────────────────────────────────────────────────────────────────────
import { Kbd } from '@/components/ui/kbd'

describe('Kbd', () => {
  it('renders keyboard key text', () => {
    render(<Kbd>⌘K</Kbd>)
    expect(screen.getByText('⌘K')).toBeInTheDocument()
  })
})

// ─── Pagination ───────────────────────────────────────────────────────────────
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination'

describe('Pagination', () => {
  it('renders pagination navigation', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    )
    expect(screen.getByRole('navigation', { name: 'pagination' })).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('active link has aria-current="page"', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#" isActive>3</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    )
    expect(screen.getByText('3').closest('a')).toHaveAttribute('aria-current', 'page')
  })
})

// ─── Popover ──────────────────────────────────────────────────────────────────
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'

describe('Popover', () => {
  it('renders trigger', () => {
    render(
      <Popover>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>,
    )
    expect(screen.getByText('Open popover')).toBeInTheDocument()
  })

  it('shows content when trigger is clicked', async () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content inside</PopoverContent>
      </Popover>,
    )
    await userEvent.click(screen.getByText('Open'))
    expect(screen.getByText('Content inside')).toBeInTheDocument()
  })
})

// ─── RadioGroup ───────────────────────────────────────────────────────────────
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

describe('RadioGroup', () => {
  it('renders radio options', () => {
    render(
      <RadioGroup defaultValue="option1">
        <div>
          <RadioGroupItem value="option1" id="opt1" />
          <Label htmlFor="opt1">Option 1</Label>
        </div>
        <div>
          <RadioGroupItem value="option2" id="opt2" />
          <Label htmlFor="opt2">Option 2</Label>
        </div>
      </RadioGroup>,
    )
    expect(screen.getAllByRole('radio')).toHaveLength(2)
    expect(screen.getByLabelText('Option 1')).toBeChecked()
  })

  it('allows selecting a different option', async () => {
    render(
      <RadioGroup defaultValue="option1">
        <div>
          <RadioGroupItem value="option1" id="opt1" />
          <Label htmlFor="opt1">Option 1</Label>
        </div>
        <div>
          <RadioGroupItem value="option2" id="opt2" />
          <Label htmlFor="opt2">Option 2</Label>
        </div>
      </RadioGroup>,
    )
    await userEvent.click(screen.getByLabelText('Option 2'))
    expect(screen.getByLabelText('Option 2')).toBeChecked()
  })
})

// ─── ScrollArea ───────────────────────────────────────────────────────────────
import { ScrollArea } from '@/components/ui/scroll-area'

describe('ScrollArea', () => {
  it('renders content inside scroll area', () => {
    render(
      <ScrollArea className="h-48">
        <p>Scrollable content</p>
      </ScrollArea>,
    )
    expect(screen.getByText('Scrollable content')).toBeInTheDocument()
  })
})

// ─── Toggle ───────────────────────────────────────────────────────────────────
import { Toggle } from '@/components/ui/toggle'

describe('Toggle', () => {
  it('renders a toggle button', () => {
    render(<Toggle>Bold</Toggle>)
    expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument()
  })

  it('toggles on/off when clicked', async () => {
    render(<Toggle>Bold</Toggle>)
    const btn = screen.getByRole('button', { name: 'Bold' })
    expect(btn).toHaveAttribute('data-state', 'off')
    await userEvent.click(btn)
    expect(btn).toHaveAttribute('data-state', 'on')
  })

  it('renders all variants without crashing', () => {
    const variants = ['default', 'outline'] as const
    variants.forEach((variant) => {
      const { unmount } = render(<Toggle variant={variant}>B</Toggle>)
      unmount()
    })
  })
})

// ─── ToggleGroup ──────────────────────────────────────────────────────────────
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

describe('ToggleGroup', () => {
  it('renders toggle group items', () => {
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="center">Center</ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>,
    )
    expect(screen.getByRole('group')).toBeInTheDocument()
    expect(screen.getByText('Left')).toBeInTheDocument()
  })

  it('selects an item on click', async () => {
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
      </ToggleGroup>,
    )
    await userEvent.click(screen.getByText('Bold'))
    expect(screen.getByText('Bold')).toHaveAttribute('data-state', 'on')
  })
})

// ─── ResizablePanelGroup ──────────────────────────────────────────────────────
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'

describe('ResizablePanelGroup', () => {
  it('renders panels', () => {
    render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50}>
          <p>Left panel</p>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>
          <p>Right panel</p>
        </ResizablePanel>
      </ResizablePanelGroup>,
    )
    expect(screen.getByText('Left panel')).toBeInTheDocument()
    expect(screen.getByText('Right panel')).toBeInTheDocument()
  })
})

// ─── Toast ────────────────────────────────────────────────────────────────────
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast'

describe('Toast', () => {
  it('renders a toast with title and description', () => {
    render(
      <ToastProvider>
        <Toast open>
          <ToastTitle>Success</ToastTitle>
          <ToastDescription>Your changes were saved.</ToastDescription>
        </Toast>
        <ToastViewport />
      </ToastProvider>,
    )
    expect(screen.getByText('Success')).toBeInTheDocument()
    expect(screen.getByText('Your changes were saved.')).toBeInTheDocument()
  })

  it('applies destructive variant', () => {
    render(
      <ToastProvider>
        <Toast open variant="destructive">
          <ToastTitle>Error</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>,
    )
    expect(screen.getByText('Error')).toBeInTheDocument()
    // Radix Toast Root renders with data-state attribute (no data-slot)
    expect(document.querySelector('[data-state="open"]')).toBeInTheDocument()
  })
})

// ─── Sonner ───────────────────────────────────────────────────────────────────
import { Toaster as SonnerToaster } from '@/components/ui/sonner'

describe('Sonner Toaster', () => {
  it('renders without crashing', () => {
    const { container } = render(<SonnerToaster />)
    expect(container).toBeInTheDocument()
  })
})

// ─── Tooltip ──────────────────────────────────────────────────────────────────
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'

describe('Tooltip', () => {
  it('renders trigger', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover for info</TooltipTrigger>
          <TooltipContent>Helpful text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )
    expect(screen.getByText('Hover for info')).toBeInTheDocument()
  })
})
