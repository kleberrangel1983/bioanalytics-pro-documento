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

// matchMedia is not available in jsdom; required by Embla Carousel, next-themes, useIsMobile.
// addListener/removeListener are the legacy API used by next-themes.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// scrollIntoView is not implemented in jsdom; required by cmdk Command component.
Element.prototype.scrollIntoView = vi.fn()

// setPointerCapture / releasePointerCapture not implemented in jsdom; required by vaul Drawer.
Element.prototype.setPointerCapture = vi.fn()
Element.prototype.releasePointerCapture = vi.fn()
