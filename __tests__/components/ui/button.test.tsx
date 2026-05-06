import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  describe('rendering', () => {
    it('renders as a <button> element by default', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
    })

    it('renders its children', () => {
      render(<Button>Submit</Button>)
      expect(screen.getByText('Submit')).toBeInTheDocument()
    })

    it('has data-slot="button" attribute', () => {
      render(<Button>Test</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('data-slot', 'button')
    })
  })

  describe('variants', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const

    it.each(variants)('renders variant "%s" without crashing', (variant) => {
      render(<Button variant={variant}>Button</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('applies default variant classes when no variant is specified', () => {
      render(<Button>Button</Button>)
      expect(screen.getByRole('button').className).toContain('bg-primary')
    })

    it('applies destructive variant classes', () => {
      render(<Button variant="destructive">Button</Button>)
      expect(screen.getByRole('button').className).toContain('bg-destructive')
    })

    it('applies outline variant classes', () => {
      render(<Button variant="outline">Button</Button>)
      expect(screen.getByRole('button').className).toContain('border')
    })

    it('applies ghost variant classes', () => {
      render(<Button variant="ghost">Button</Button>)
      expect(screen.getByRole('button').className).toContain('hover:bg-accent')
    })

    it('applies link variant classes', () => {
      render(<Button variant="link">Button</Button>)
      expect(screen.getByRole('button').className).toContain('underline-offset-4')
    })
  })

  describe('sizes', () => {
    const sizes = ['default', 'sm', 'lg', 'icon', 'icon-sm', 'icon-lg'] as const

    it.each(sizes)('renders size "%s" without crashing', (size) => {
      render(<Button size={size}>B</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('applies sm size classes', () => {
      render(<Button size="sm">Button</Button>)
      expect(screen.getByRole('button').className).toContain('h-8')
    })

    it('applies lg size classes', () => {
      render(<Button size="lg">Button</Button>)
      expect(screen.getByRole('button').className).toContain('h-10')
    })

    it('applies icon size classes', () => {
      render(<Button size="icon">B</Button>)
      expect(screen.getByRole('button').className).toContain('size-9')
    })
  })

  describe('asChild prop', () => {
    it('renders the child element instead of a button when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/home">Home</a>
        </Button>,
      )
      expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('native button props', () => {
    it('forwards className to the button', () => {
      render(<Button className="my-custom-class">Button</Button>)
      expect(screen.getByRole('button').className).toContain('my-custom-class')
    })

    it('forwards disabled prop', () => {
      render(<Button disabled>Button</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('calls onClick handler when clicked', async () => {
      const onClick = vi.fn()
      render(<Button onClick={onClick}>Click me</Button>)
      await userEvent.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalledOnce()
    })

    it('does not call onClick when disabled', async () => {
      const onClick = vi.fn()
      render(
        <Button disabled onClick={onClick}>
          Click me
        </Button>,
      )
      await userEvent.click(screen.getByRole('button'))
      expect(onClick).not.toHaveBeenCalled()
    })

    it('forwards type prop', () => {
      render(<Button type="submit">Submit</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
    })

    it('forwards aria-label prop', () => {
      render(<Button aria-label="Close dialog">×</Button>)
      expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument()
    })
  })
})
