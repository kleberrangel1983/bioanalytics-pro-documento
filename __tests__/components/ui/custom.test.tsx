/**
 * Tests for the custom (non-Radix-wrapper) UI components:
 * ButtonGroup, Field, Item, and Toaster.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { renderHook } from '@testing-library/react'

// ─── ButtonGroup ──────────────────────────────────────────────────────────────
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from '@/components/ui/button-group'
import { Button } from '@/components/ui/button'

describe('ButtonGroup', () => {
  it('renders children', () => {
    render(
      <ButtonGroup>
        <Button>Save</Button>
        <Button>Cancel</Button>
      </ButtonGroup>,
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('has data-slot="button-group"', () => {
    render(
      <ButtonGroup>
        <Button>A</Button>
      </ButtonGroup>,
    )
    expect(document.querySelector('[data-slot="button-group"]')).toBeInTheDocument()
  })

  it('renders horizontal by default (no flex-col)', () => {
    render(
      <ButtonGroup>
        <Button>A</Button>
      </ButtonGroup>,
    )
    const group = document.querySelector('[data-slot="button-group"]')
    expect(group?.className).not.toContain('flex-col')
  })

  it('renders vertical orientation', () => {
    render(
      <ButtonGroup orientation="vertical">
        <Button>A</Button>
        <Button>B</Button>
      </ButtonGroup>,
    )
    const group = document.querySelector('[data-slot="button-group"]')
    expect(group?.className).toContain('flex-col')
  })

  it('renders ButtonGroupSeparator', () => {
    render(
      <ButtonGroup>
        <Button>A</Button>
        <ButtonGroupSeparator />
        <Button>B</Button>
      </ButtonGroup>,
    )
    expect(
      document.querySelector('[data-slot="button-group-separator"]'),
    ).toBeInTheDocument()
  })

  it('renders ButtonGroupText', () => {
    render(
      <ButtonGroup>
        <ButtonGroupText>or</ButtonGroupText>
      </ButtonGroup>,
    )
    expect(screen.getByText('or')).toBeInTheDocument()
  })
})

// ─── Field ────────────────────────────────────────────────────────────────────
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSet,
  FieldLegend,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

describe('Field', () => {
  it('renders label and description', () => {
    render(
      <Field>
        <FieldLabel>Email</FieldLabel>
        <FieldGroup>
          <Input placeholder="you@example.com" />
        </FieldGroup>
        <FieldDescription>We will never share your email.</FieldDescription>
      </Field>,
    )
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('We will never share your email.')).toBeInTheDocument()
  })

  it('has data-slot="field"', () => {
    render(<Field><FieldLabel>Label</FieldLabel></Field>)
    expect(document.querySelector('[data-slot="field"]')).toBeInTheDocument()
  })

  describe('FieldError', () => {
    it('renders a string error message', () => {
      render(<Field><FieldError>This field is required.</FieldError></Field>)
      expect(screen.getByText('This field is required.')).toBeInTheDocument()
    })

    it('renders an array of error messages', () => {
      render(
        <Field>
          <FieldError errors={[{ message: 'Too short' }, { message: 'Must contain a number' }]} />
        </Field>,
      )
      expect(screen.getByText('Too short')).toBeInTheDocument()
      expect(screen.getByText('Must contain a number')).toBeInTheDocument()
    })

    it('renders nothing when errors array is empty', () => {
      render(<Field><FieldError errors={[]} /></Field>)
      // Wrapper renders but contains no error list items
      expect(document.querySelectorAll('[data-slot="field-error"] li')).toHaveLength(0)
    })
  })

  describe('FieldSet', () => {
    it('renders fieldset with legend', () => {
      render(
        <FieldSet>
          <FieldLegend>Personal info</FieldLegend>
          <Field><FieldLabel>Name</FieldLabel></Field>
        </FieldSet>,
      )
      expect(screen.getByText('Personal info')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
    })
  })
})

// ─── Item ─────────────────────────────────────────────────────────────────────
import {
  Item,
  ItemContent,
  ItemActions,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
  ItemGroup,
  ItemSeparator,
} from '@/components/ui/item'

describe('Item', () => {
  it('renders item with title and description', () => {
    render(
      <Item>
        <ItemContent>
          <ItemTitle>John Doe</ItemTitle>
          <ItemDescription>Software Engineer</ItemDescription>
        </ItemContent>
      </Item>,
    )
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Software Engineer')).toBeInTheDocument()
  })

  it('has data-slot="item"', () => {
    render(<Item>content</Item>)
    expect(document.querySelector('[data-slot="item"]')).toBeInTheDocument()
  })

  it('renders item with actions', () => {
    render(
      <Item>
        <ItemContent>
          <ItemTitle>File</ItemTitle>
        </ItemContent>
        <ItemActions>
          <button>Delete</button>
        </ItemActions>
      </Item>,
    )
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('renders item header and footer', () => {
    render(
      <Item>
        <ItemHeader>Header</ItemHeader>
        <ItemContent>
          <ItemTitle>Title</ItemTitle>
        </ItemContent>
        <ItemFooter>Footer</ItemFooter>
      </Item>,
    )
    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('renders all variants without crashing', () => {
    const variants = ['default', 'card', 'ghost'] as const
    variants.forEach((variant) => {
      const { unmount } = render(<Item variant={variant}>item</Item>)
      unmount()
    })
  })

  it('renders ItemGroup with separator', () => {
    render(
      <ItemGroup>
        <Item>
          <ItemContent><ItemTitle>A</ItemTitle></ItemContent>
        </Item>
        <ItemSeparator />
        <Item>
          <ItemContent><ItemTitle>B</ItemTitle></ItemContent>
        </Item>
      </ItemGroup>,
    )
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="item-separator"]')).toBeInTheDocument()
  })
})

// ─── Toaster ──────────────────────────────────────────────────────────────────
import { Toaster } from '@/components/ui/toaster'
import { toast } from '@/hooks/use-toast'
import { useToast } from '@/hooks/use-toast'

const TOAST_REMOVE_DELAY = 1000000

describe('Toaster', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.dismiss()
      vi.advanceTimersByTime(TOAST_REMOVE_DELAY + 1)
    })
    vi.useRealTimers()
  })

  it('renders without crashing when no toasts are present', () => {
    const { container } = render(<Toaster />)
    expect(container).toBeInTheDocument()
  })

  it('renders a toast when toast() is called', async () => {
    render(<Toaster />)
    act(() => {
      toast({ title: 'Hello', description: 'Toast message' })
    })
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('Toast message')).toBeInTheDocument()
  })

  it('shows the toast close button', () => {
    render(<Toaster />)
    act(() => {
      toast({ title: 'Closeable' })
    })
    // ToastClose renders with toast-close="" attribute (not data-slot)
    expect(document.querySelector('[toast-close]')).toBeInTheDocument()
  })
})
