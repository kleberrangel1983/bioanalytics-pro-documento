import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToast, toast } from '@/hooks/use-toast'

const TOAST_REMOVE_DELAY = 1000000

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  // Dismiss all toasts and flush the removal queue so module state is clean
  const { result } = renderHook(() => useToast())
  act(() => {
    result.current.dismiss()
    vi.advanceTimersByTime(TOAST_REMOVE_DELAY + 1)
  })
  vi.useRealTimers()
})

describe('useToast', () => {
  it('returns an empty toasts array on first render', () => {
    const { result } = renderHook(() => useToast())
    expect(result.current.toasts).toHaveLength(0)
  })

  it('exposes toast and dismiss functions', () => {
    const { result } = renderHook(() => useToast())
    expect(typeof result.current.toast).toBe('function')
    expect(typeof result.current.dismiss).toBe('function')
  })

  it('adds a toast when toast() is called', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.toast({ title: 'Hello world' })
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].title).toBe('Hello world')
  })

  it('new toast replaces the existing one (TOAST_LIMIT = 1)', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.toast({ title: 'First' })
    })
    act(() => {
      result.current.toast({ title: 'Second' })
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].title).toBe('Second')
  })

  it('toast is open by default', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.toast({ title: 'Open toast' })
    })

    expect(result.current.toasts[0].open).toBe(true)
  })

  it('dismiss with id sets the toast open to false', () => {
    const { result } = renderHook(() => useToast())
    let toastId: string

    act(() => {
      const t = result.current.toast({ title: 'Dismissible' })
      toastId = t.id
    })

    act(() => {
      result.current.dismiss(toastId!)
    })

    expect(result.current.toasts[0].open).toBe(false)
  })

  it('dismiss without id sets all toasts to open=false', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.toast({ title: 'Toast' })
    })

    act(() => {
      result.current.dismiss()
    })

    expect(result.current.toasts.every((t) => t.open === false)).toBe(true)
  })

  it('toast removal is scheduled after dismiss', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.toast({ title: 'Toast' })
    })
    act(() => {
      result.current.dismiss()
    })

    // Before the removal delay, toast still exists (just closed)
    expect(result.current.toasts).toHaveLength(1)

    // After the removal delay, toast is removed
    act(() => {
      vi.advanceTimersByTime(TOAST_REMOVE_DELAY + 1)
    })

    expect(result.current.toasts).toHaveLength(0)
  })

  it('the update function returned by toast() updates the toast', () => {
    const { result } = renderHook(() => useToast())
    let update: ReturnType<typeof toast>['update']

    act(() => {
      const t = result.current.toast({ title: 'Original' })
      update = t.update
    })

    act(() => {
      update({ id: result.current.toasts[0].id, title: 'Updated' } as any)
    })

    expect(result.current.toasts[0].title).toBe('Updated')
  })

  it('multiple hook instances share the same global state', () => {
    const { result: hookA } = renderHook(() => useToast())
    const { result: hookB } = renderHook(() => useToast())

    act(() => {
      hookA.current.toast({ title: 'Shared toast' })
    })

    expect(hookB.current.toasts).toHaveLength(1)
    expect(hookB.current.toasts[0].title).toBe('Shared toast')
  })
})
