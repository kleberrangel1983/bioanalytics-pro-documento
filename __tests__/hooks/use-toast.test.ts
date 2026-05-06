import { describe, it, expect, beforeEach } from 'vitest'
import { reducer } from '@/hooks/use-toast'

type ToastState = { toasts: Array<{ id: string; open?: boolean; title?: string }> }

const makeToast = (id: string, overrides = {}) => ({
  id,
  title: `Toast ${id}`,
  open: true,
  ...overrides,
})

const emptyState: ToastState = { toasts: [] }

describe('reducer', () => {
  describe('ADD_TOAST', () => {
    it('adds a toast to an empty list', () => {
      const toast = makeToast('1')
      const state = reducer(emptyState as any, { type: 'ADD_TOAST', toast: toast as any })
      expect(state.toasts).toHaveLength(1)
      expect(state.toasts[0].id).toBe('1')
    })

    it('prepends the new toast to the front of the list', () => {
      const existing = makeToast('1')
      const initial = { toasts: [existing] } as any
      const newToast = makeToast('2')
      const state = reducer(initial, { type: 'ADD_TOAST', toast: newToast as any })
      expect(state.toasts[0].id).toBe('2')
    })

    it('enforces TOAST_LIMIT of 1 — drops older toasts', () => {
      const existing = makeToast('1')
      const initial = { toasts: [existing] } as any
      const newToast = makeToast('2')
      const state = reducer(initial, { type: 'ADD_TOAST', toast: newToast as any })
      expect(state.toasts).toHaveLength(1)
      expect(state.toasts[0].id).toBe('2')
    })

    it('does not mutate the original state', () => {
      const original = { toasts: [] } as any
      reducer(original, { type: 'ADD_TOAST', toast: makeToast('1') as any })
      expect(original.toasts).toHaveLength(0)
    })
  })

  describe('UPDATE_TOAST', () => {
    it('updates an existing toast by id', () => {
      const initial = { toasts: [makeToast('1', { title: 'Original' })] } as any
      const state = reducer(initial, {
        type: 'UPDATE_TOAST',
        toast: { id: '1', title: 'Updated' } as any,
      })
      expect(state.toasts[0].title).toBe('Updated')
    })

    it('does not affect toasts with a different id', () => {
      const initial = {
        toasts: [makeToast('1', { title: 'A' }), makeToast('2', { title: 'B' })],
      } as any
      const state = reducer(initial, {
        type: 'UPDATE_TOAST',
        toast: { id: '1', title: 'Updated A' } as any,
      })
      expect(state.toasts[1].title).toBe('B')
    })

    it('returns state unchanged when id does not match any toast', () => {
      const initial = { toasts: [makeToast('1')] } as any
      const state = reducer(initial, {
        type: 'UPDATE_TOAST',
        toast: { id: 'nonexistent', title: 'X' } as any,
      })
      expect(state.toasts[0].id).toBe('1')
      expect(state.toasts[0].title).toBe('Toast 1')
    })
  })

  describe('DISMISS_TOAST', () => {
    it('sets open=false on the targeted toast', () => {
      const initial = { toasts: [makeToast('1', { open: true })] } as any
      const state = reducer(initial, { type: 'DISMISS_TOAST', toastId: '1' })
      expect(state.toasts[0].open).toBe(false)
    })

    it('dismisses all toasts when no toastId is provided', () => {
      const initial = {
        toasts: [makeToast('1', { open: true }), makeToast('2', { open: true })],
      } as any
      const state = reducer(initial, { type: 'DISMISS_TOAST' })
      expect(state.toasts.every((t: any) => t.open === false)).toBe(true)
    })

    it('does not affect toasts with a different id', () => {
      const initial = {
        toasts: [makeToast('1', { open: true }), makeToast('2', { open: true })],
      } as any
      const state = reducer(initial, { type: 'DISMISS_TOAST', toastId: '1' })
      expect(state.toasts[1].open).toBe(true)
    })
  })

  describe('REMOVE_TOAST', () => {
    it('removes the toast with the given id', () => {
      const initial = { toasts: [makeToast('1'), makeToast('2')] } as any
      const state = reducer(initial, { type: 'REMOVE_TOAST', toastId: '1' })
      expect(state.toasts).toHaveLength(1)
      expect(state.toasts[0].id).toBe('2')
    })

    it('clears all toasts when no toastId is provided', () => {
      const initial = { toasts: [makeToast('1'), makeToast('2')] } as any
      const state = reducer(initial, { type: 'REMOVE_TOAST' })
      expect(state.toasts).toHaveLength(0)
    })

    it('returns unchanged state when id does not match', () => {
      const initial = { toasts: [makeToast('1')] } as any
      const state = reducer(initial, { type: 'REMOVE_TOAST', toastId: 'nonexistent' })
      expect(state.toasts).toHaveLength(1)
    })
  })
})
