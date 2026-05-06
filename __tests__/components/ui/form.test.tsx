import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const schema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
})

type FormValues = z.infer<typeof schema>

function TestForm({
  defaultValues = { username: '' },
  onSubmit = () => {},
}: {
  defaultValues?: Partial<FormValues>
  onSubmit?: (values: FormValues) => void
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} data-testid="form">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormDescription>Your public display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  )
}

describe('Form components', () => {
  describe('FormItem', () => {
    it('renders a div with data-slot="form-item"', () => {
      render(<TestForm />)
      expect(document.querySelector('[data-slot="form-item"]')).toBeInTheDocument()
    })
  })

  describe('FormLabel', () => {
    it('renders the label text', () => {
      render(<TestForm />)
      expect(screen.getByText('Username')).toBeInTheDocument()
    })

    it('has data-slot="form-label" attribute', () => {
      render(<TestForm />)
      expect(document.querySelector('[data-slot="form-label"]')).toBeInTheDocument()
    })

    it('is associated with the input via htmlFor', () => {
      render(<TestForm />)
      const label = screen.getByText('Username')
      const input = screen.getByPlaceholderText('Enter username')
      expect(label).toHaveAttribute('for', input.id)
    })
  })

  describe('FormControl', () => {
    it('renders the input inside the form control', () => {
      render(<TestForm />)
      expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument()
    })

    it('has data-slot="form-control" attribute', () => {
      render(<TestForm />)
      expect(document.querySelector('[data-slot="form-control"]')).toBeInTheDocument()
    })

    it('sets aria-invalid=false when there is no error', () => {
      render(<TestForm />)
      const control = document.querySelector('[data-slot="form-control"]')
      expect(control).toHaveAttribute('aria-invalid', 'false')
    })
  })

  describe('FormDescription', () => {
    it('renders the description text', () => {
      render(<TestForm />)
      expect(screen.getByText('Your public display name.')).toBeInTheDocument()
    })

    it('has data-slot="form-description" attribute', () => {
      render(<TestForm />)
      expect(document.querySelector('[data-slot="form-description"]')).toBeInTheDocument()
    })
  })

  describe('FormMessage', () => {
    it('does not render when there is no error', () => {
      render(<TestForm />)
      expect(document.querySelector('[data-slot="form-message"]')).not.toBeInTheDocument()
    })

    it('displays validation error message after failed submit', async () => {
      const { getByRole } = render(<TestForm defaultValues={{ username: '' }} />)

      await getByRole('button', { name: 'Submit' }).click()

      await screen.findByText('Username must be at least 3 characters')
      expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument()
    })

    it('has data-slot="form-message" when error is present', async () => {
      render(<TestForm defaultValues={{ username: '' }} />)

      screen.getByRole('button', { name: 'Submit' }).click()

      await screen.findByText('Username must be at least 3 characters')
      expect(document.querySelector('[data-slot="form-message"]')).toBeInTheDocument()
    })
  })

  describe('aria accessibility', () => {
    it('associates the control with the description via aria-describedby', () => {
      render(<TestForm />)
      const control = document.querySelector('[data-slot="form-control"]')
      const description = document.querySelector('[data-slot="form-description"]')
      expect(control?.getAttribute('aria-describedby')).toContain(description?.id)
    })

    it('includes the message id in aria-describedby when there is an error', async () => {
      render(<TestForm defaultValues={{ username: '' }} />)

      screen.getByRole('button', { name: 'Submit' }).click()
      await screen.findByText('Username must be at least 3 characters')

      const control = document.querySelector('[data-slot="form-control"]')
      const message = document.querySelector('[data-slot="form-message"]')
      expect(control?.getAttribute('aria-describedby')).toContain(message?.id)
    })
  })
})
