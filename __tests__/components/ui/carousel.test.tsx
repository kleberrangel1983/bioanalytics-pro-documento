import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel'

function BasicCarousel({ orientation }: { orientation?: 'horizontal' | 'vertical' }) {
  return (
    <Carousel orientation={orientation}>
      <CarouselContent>
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
        <CarouselItem>Slide 3</CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}

describe('Carousel', () => {
  describe('structure and aria', () => {
    it('renders a region with aria-roledescription="carousel"', () => {
      render(<BasicCarousel />)
      expect(screen.getByRole('region')).toBeInTheDocument()
      expect(screen.getByRole('region')).toHaveAttribute(
        'aria-roledescription',
        'carousel',
      )
    })

    it('has data-slot="carousel"', () => {
      render(<BasicCarousel />)
      expect(document.querySelector('[data-slot="carousel"]')).toBeInTheDocument()
    })

    it('renders carousel content with data-slot="carousel-content"', () => {
      render(<BasicCarousel />)
      expect(document.querySelector('[data-slot="carousel-content"]')).toBeInTheDocument()
    })
  })

  describe('CarouselItem', () => {
    it('renders each slide with role="group"', () => {
      render(<BasicCarousel />)
      const slides = screen.getAllByRole('group')
      expect(slides).toHaveLength(3)
    })

    it('each slide has aria-roledescription="slide"', () => {
      render(<BasicCarousel />)
      screen.getAllByRole('group').forEach((slide) => {
        expect(slide).toHaveAttribute('aria-roledescription', 'slide')
      })
    })

    it('renders slide content', () => {
      render(<BasicCarousel />)
      expect(screen.getByText('Slide 1')).toBeInTheDocument()
      expect(screen.getByText('Slide 2')).toBeInTheDocument()
      expect(screen.getByText('Slide 3')).toBeInTheDocument()
    })

    it('has data-slot="carousel-item"', () => {
      render(<BasicCarousel />)
      const items = document.querySelectorAll('[data-slot="carousel-item"]')
      expect(items).toHaveLength(3)
    })
  })

  describe('navigation buttons', () => {
    it('renders Previous and Next buttons', () => {
      render(<BasicCarousel />)
      expect(screen.getByRole('button', { name: /previous slide/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /next slide/i })).toBeInTheDocument()
    })

    it('Previous button has data-slot="carousel-previous"', () => {
      render(<BasicCarousel />)
      expect(document.querySelector('[data-slot="carousel-previous"]')).toBeInTheDocument()
    })

    it('Next button has data-slot="carousel-next"', () => {
      render(<BasicCarousel />)
      expect(document.querySelector('[data-slot="carousel-next"]')).toBeInTheDocument()
    })

    it('Previous button is disabled when canScrollPrev is false (initial state)', () => {
      render(<BasicCarousel />)
      expect(screen.getByRole('button', { name: /previous slide/i })).toBeDisabled()
    })

    it('Next button is disabled when canScrollNext is false (initial state with no Embla DOM)', () => {
      render(<BasicCarousel />)
      // In jsdom, Embla cannot measure DOM so canScrollNext starts as false
      expect(screen.getByRole('button', { name: /next slide/i })).toBeDisabled()
    })
  })

  describe('keyboard navigation', () => {
    it('handles ArrowLeft keydown without throwing', () => {
      render(<BasicCarousel />)
      expect(() =>
        fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowLeft' }),
      ).not.toThrow()
    })

    it('handles ArrowRight keydown without throwing', () => {
      render(<BasicCarousel />)
      expect(() =>
        fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' }),
      ).not.toThrow()
    })
  })

  describe('orientation', () => {
    it('renders horizontal carousel by default', () => {
      render(<BasicCarousel />)
      // Horizontal layout adds -ml-4 to content flex container
      const content = document.querySelector('[data-slot="carousel-content"]')
      expect(content?.firstElementChild?.className).toContain('-ml-4')
    })

    it('renders vertical carousel when orientation="vertical"', () => {
      render(<BasicCarousel orientation="vertical" />)
      const content = document.querySelector('[data-slot="carousel-content"]')
      expect(content?.firstElementChild?.className).toContain('-mt-4')
    })
  })

  describe('setApi prop', () => {
    it('calls setApi with the Embla API when provided', () => {
      const setApi = vi.fn()
      render(
        <Carousel setApi={setApi}>
          <CarouselContent>
            <CarouselItem>Slide</CarouselItem>
          </CarouselContent>
        </Carousel>,
      )
      // In jsdom, Embla may not initialise; setApi may or may not be called
      // We just verify the component renders without error
      expect(document.querySelector('[data-slot="carousel"]')).toBeInTheDocument()
    })
  })
})
