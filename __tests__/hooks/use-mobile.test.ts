import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from '@/hooks/use-mobile'

const MOBILE_BREAKPOINT = 768

function setWindowWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
}

function createMqlMock(matches: boolean) {
  const listeners: Array<() => void> = []
  return {
    matches,
    addEventListener: vi.fn((_event: string, cb: () => void) => {
      listeners.push(cb)
    }),
    removeEventListener: vi.fn((_event: string, cb: () => void) => {
      const idx = listeners.indexOf(cb)
      if (idx > -1) listeners.splice(idx, 1)
    }),
    _listeners: listeners,
    _trigger() {
      listeners.forEach((l) => l())
    },
  }
}

describe('useIsMobile', () => {
  let mql: ReturnType<typeof createMqlMock>

  beforeEach(() => {
    mql = createMqlMock(false)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn(() => mql),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns false when window width is at the breakpoint (768px)', () => {
    setWindowWidth(MOBILE_BREAKPOINT)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('returns false when window width is above the breakpoint', () => {
    setWindowWidth(1024)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('returns true when window width is below the breakpoint', () => {
    setWindowWidth(MOBILE_BREAKPOINT - 1)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('updates to true when window resizes to mobile width', () => {
    setWindowWidth(1024)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    act(() => {
      setWindowWidth(375)
      mql._trigger()
    })

    expect(result.current).toBe(true)
  })

  it('updates to false when window resizes from mobile to desktop width', () => {
    setWindowWidth(375)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)

    act(() => {
      setWindowWidth(1280)
      mql._trigger()
    })

    expect(result.current).toBe(false)
  })

  it('removes the event listener on unmount', () => {
    setWindowWidth(375)
    const { unmount } = renderHook(() => useIsMobile())
    unmount()
    expect(mql.removeEventListener).toHaveBeenCalledOnce()
  })

  it('subscribes to the matchMedia change event on mount', () => {
    setWindowWidth(375)
    renderHook(() => useIsMobile())
    expect(mql.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })
})
