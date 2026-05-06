import { describe, it, expect, afterEach, vi } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useIsMobile } from "./use-mobile"

const BREAKPOINT = 768

function setWindowWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  })
}

function mockMatchMedia(matches: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = []

  const mql = {
    matches,
    addEventListener: vi.fn((_: string, cb: (e: MediaQueryListEvent) => void) => {
      listeners.push(cb)
    }),
    removeEventListener: vi.fn((_: string, cb: (e: MediaQueryListEvent) => void) => {
      const idx = listeners.indexOf(cb)
      if (idx > -1) listeners.splice(idx, 1)
    }),
    dispatchChange: () => {
      listeners.forEach((cb) => cb({} as MediaQueryListEvent))
    },
  }

  window.matchMedia = vi.fn().mockReturnValue(mql)
  return mql
}

describe("useIsMobile", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("retorna false quando o viewport é igual ao breakpoint (768px)", () => {
    setWindowWidth(BREAKPOINT)
    mockMatchMedia(false)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it("retorna false quando o viewport é maior que o breakpoint (1024px)", () => {
    setWindowWidth(1024)
    mockMatchMedia(false)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it("retorna true quando o viewport é menor que o breakpoint (767px)", () => {
    setWindowWidth(BREAKPOINT - 1)
    mockMatchMedia(true)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it("remove o listener do matchMedia ao desmontar", () => {
    setWindowWidth(1024)
    const mql = mockMatchMedia(false)
    const { unmount } = renderHook(() => useIsMobile())
    unmount()
    expect(mql.removeEventListener).toHaveBeenCalledOnce()
  })

  it("atualiza o valor quando o matchMedia dispara mudança para mobile", () => {
    setWindowWidth(1024)
    const mql = mockMatchMedia(false)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    act(() => {
      setWindowWidth(375)
      mql.dispatchChange()
    })

    expect(result.current).toBe(true)
  })
})
