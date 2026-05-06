/**
 * Smoke tests: verify each component renders without throwing.
 * These catch import errors, missing context, and crash-on-render bugs.
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

// ─── Alert ────────────────────────────────────────────────────────────────────
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

describe('Alert', () => {
  it('renders Alert with title and description', () => {
    render(
      <Alert>
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>Something happened.</AlertDescription>
      </Alert>,
    )
    expect(screen.getByText('Heads up!')).toBeInTheDocument()
    expect(screen.getByText('Something happened.')).toBeInTheDocument()
  })

  it('applies destructive variant', () => {
    render(<Alert variant="destructive"><AlertTitle>Error</AlertTitle></Alert>)
    expect(screen.getByText('Error')).toBeInTheDocument()
  })
})

// ─── Badge ────────────────────────────────────────────────────────────────────
import { Badge } from '@/components/ui/badge'

describe('Badge', () => {
  it('renders badge text', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('renders all variants without crashing', () => {
    const variants = ['default', 'secondary', 'destructive', 'outline'] as const
    variants.forEach((variant) => {
      const { unmount } = render(<Badge variant={variant}>Badge</Badge>)
      unmount()
    })
  })
})

// ─── Card ─────────────────────────────────────────────────────────────────────
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '@/components/ui/card'

describe('Card', () => {
  it('renders full card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
          <CardAction>Action</CardAction>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    )
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('has data-slot="card" on the root element', () => {
    render(<Card>content</Card>)
    expect(document.querySelector('[data-slot="card"]')).toBeInTheDocument()
  })
})

// ─── Input ────────────────────────────────────────────────────────────────────
import { Input } from '@/components/ui/input'

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input placeholder="Type here" />)
    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument()
  })

  it('renders as disabled', () => {
    render(<Input disabled placeholder="disabled" />)
    expect(screen.getByPlaceholderText('disabled')).toBeDisabled()
  })

  it('forwards type prop', () => {
    render(<Input type="email" placeholder="email" />)
    expect(screen.getByPlaceholderText('email')).toHaveAttribute('type', 'email')
  })
})

// ─── Label ────────────────────────────────────────────────────────────────────
import { Label } from '@/components/ui/label'

describe('Label', () => {
  it('renders label text', () => {
    render(<Label>Email</Label>)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('associates with an input via htmlFor', () => {
    render(
      <>
        <Label htmlFor="email-input">Email</Label>
        <Input id="email-input" placeholder="email" />
      </>,
    )
    expect(screen.getByText('Email')).toHaveAttribute('for', 'email-input')
  })
})

// ─── Textarea ─────────────────────────────────────────────────────────────────
import { Textarea } from '@/components/ui/textarea'

describe('Textarea', () => {
  it('renders a textarea element', () => {
    render(<Textarea placeholder="Write something" />)
    expect(screen.getByPlaceholderText('Write something')).toBeInTheDocument()
  })

  it('accepts value input', () => {
    render(<Textarea defaultValue="Hello" />)
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('Hello')
  })
})

// ─── Checkbox ─────────────────────────────────────────────────────────────────
import { Checkbox } from '@/components/ui/checkbox'

describe('Checkbox', () => {
  it('renders a checkbox', () => {
    render(<Checkbox />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('renders in checked state', () => {
    render(<Checkbox checked />)
    expect(screen.getByRole('checkbox')).toHaveAttribute('data-state', 'checked')
  })

  it('renders in disabled state', () => {
    render(<Checkbox disabled />)
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })
})

// ─── Skeleton ─────────────────────────────────────────────────────────────────
import { Skeleton } from '@/components/ui/skeleton'

describe('Skeleton', () => {
  it('renders a skeleton element', () => {
    const { container } = render(<Skeleton className="h-4 w-full" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has data-slot="skeleton"', () => {
    render(<Skeleton />)
    expect(document.querySelector('[data-slot="skeleton"]')).toBeInTheDocument()
  })
})

// ─── Spinner ──────────────────────────────────────────────────────────────────
import { Spinner } from '@/components/ui/spinner'

describe('Spinner', () => {
  it('renders an svg element', () => {
    const { container } = render(<Spinner />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})

// ─── Progress ─────────────────────────────────────────────────────────────────
import { Progress } from '@/components/ui/progress'

describe('Progress', () => {
  it('renders a progress bar', () => {
    render(<Progress value={50} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('reflects the value via the indicator transform style', () => {
    render(<Progress value={75} />)
    const indicator = document.querySelector('[data-slot="progress-indicator"]') as HTMLElement
    // indicator is translated by -(100 - value)% = -25%
    expect(indicator?.style.transform).toBe('translateX(-25%)')
  })
})

// ─── Separator ────────────────────────────────────────────────────────────────
import { Separator } from '@/components/ui/separator'

describe('Separator', () => {
  it('renders a horizontal separator by default', () => {
    render(<Separator />)
    // Shadcn Separator sets decorative=true, so Radix renders role="none"
    expect(document.querySelector('[data-slot="separator"]')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="separator"]')).toHaveAttribute(
      'data-orientation',
      'horizontal',
    )
  })

  it('renders a vertical separator', () => {
    render(<Separator orientation="vertical" />)
    expect(document.querySelector('[data-slot="separator"]')).toHaveAttribute(
      'data-orientation',
      'vertical',
    )
  })
})

// ─── Avatar ───────────────────────────────────────────────────────────────────
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

describe('Avatar', () => {
  it('renders fallback text when image is absent', () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    )
    expect(screen.getByText('AB')).toBeInTheDocument()
  })
})

// ─── Tabs ─────────────────────────────────────────────────────────────────────
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

describe('Tabs', () => {
  it('renders tabs and content', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>,
    )
    expect(screen.getByText('Tab 1')).toBeInTheDocument()
    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })

  it('active tab trigger has data-state="active"', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>,
    )
    expect(screen.getByText('Tab 1')).toHaveAttribute('data-state', 'active')
  })
})

// ─── Accordion ────────────────────────────────────────────────────────────────
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'

describe('Accordion', () => {
  it('renders accordion with items', () => {
    render(
      <Accordion type="single">
        <AccordionItem value="item-1">
          <AccordionTrigger>Question 1</AccordionTrigger>
          <AccordionContent>Answer 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )
    expect(screen.getByText('Question 1')).toBeInTheDocument()
  })

  it('trigger has role="button"', () => {
    render(
      <Accordion type="single">
        <AccordionItem value="item-1">
          <AccordionTrigger>FAQ</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )
    expect(screen.getByRole('button', { name: 'FAQ' })).toBeInTheDocument()
  })
})

// ─── Empty ────────────────────────────────────────────────────────────────────
import { Empty, EmptyTitle, EmptyDescription } from '@/components/ui/empty'

describe('Empty', () => {
  it('renders empty state with title and description', () => {
    render(
      <Empty>
        <EmptyTitle>No results</EmptyTitle>
        <EmptyDescription>Try adjusting your search.</EmptyDescription>
      </Empty>,
    )
    expect(screen.getByText('No results')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your search.')).toBeInTheDocument()
  })
})

// ─── Select ───────────────────────────────────────────────────────────────────
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

describe('Select', () => {
  it('renders a select trigger', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Choose…" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Option A</SelectItem>
        </SelectContent>
      </Select>,
    )
    expect(screen.getByText('Choose…')).toBeInTheDocument()
  })
})

// ─── Switch ───────────────────────────────────────────────────────────────────
import { Switch } from '@/components/ui/switch'

describe('Switch', () => {
  it('renders a switch', () => {
    render(<Switch />)
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('renders in checked state', () => {
    render(<Switch checked />)
    expect(screen.getByRole('switch')).toHaveAttribute('data-state', 'checked')
  })
})

// ─── Slider ───────────────────────────────────────────────────────────────────
import { Slider } from '@/components/ui/slider'

describe('Slider', () => {
  it('renders a slider', () => {
    render(<Slider defaultValue={[50]} max={100} step={1} />)
    expect(screen.getByRole('slider')).toBeInTheDocument()
  })
})

// ─── Table ────────────────────────────────────────────────────────────────────
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'

describe('Table', () => {
  it('renders a complete table structure', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Alice</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })
})
