import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn', () => {
  it('returns a single class unchanged', () => {
    expect(cn('foo')).toBe('foo')
  })

  it('joins multiple classes', () => {
    expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz')
  })

  it('ignores falsy values', () => {
    expect(cn('foo', undefined, null, false, 'bar')).toBe('foo bar')
  })

  it('handles conditional classes via objects', () => {
    expect(cn({ 'font-bold': true, 'text-red-500': false })).toBe('font-bold')
  })

  it('handles array inputs', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })

  it('merges conflicting Tailwind classes, keeping the last one', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
  })

  it('merges conflicting padding classes', () => {
    expect(cn('px-4', 'px-2')).toBe('px-2')
  })

  it('merges conflicting text-size classes', () => {
    expect(cn('text-sm', 'text-lg')).toBe('text-lg')
  })

  it('handles mixed conditional and string inputs', () => {
    const isActive = true
    expect(cn('btn', { 'btn-active': isActive, 'btn-disabled': !isActive })).toBe(
      'btn btn-active',
    )
  })

  it('returns empty string for no inputs', () => {
    expect(cn()).toBe('')
  })

  it('returns empty string for all falsy inputs', () => {
    expect(cn(undefined, null, false)).toBe('')
  })

  it('deduplicates identical classes via tailwind-merge', () => {
    expect(cn('p-4', 'p-4')).toBe('p-4')
  })

  it('preserves non-conflicting Tailwind classes', () => {
    const result = cn('flex', 'items-center', 'bg-blue-500')
    expect(result).toContain('flex')
    expect(result).toContain('items-center')
    expect(result).toContain('bg-blue-500')
  })
})
