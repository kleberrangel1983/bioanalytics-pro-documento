import '@testing-library/jest-dom'
import { vi } from 'vitest'

// ResizeObserver is not available in jsdom; required by Embla Carousel, Radix Slider, etc.
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// IntersectionObserver is not available in jsdom; required by Embla Carousel slide-in-view logic.
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return [] }
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds = []
}

// matchMedia is not available in jsdom; required by Embla Carousel breakpoint detection.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
