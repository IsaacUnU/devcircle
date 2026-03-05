import { describe, it, expect } from 'vitest'
import { cn, truncate, formatCount, getAvatarUrl } from '@/lib/utils'

describe('cn()', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })
  it('handles conditional classes', () => {
    expect(cn('base', false && 'no', 'yes')).toBe('base yes')
  })
  it('deduplicates tailwind classes', () => {
    expect(cn('text-red-400', 'text-brand-400')).toBe('text-brand-400')
  })
})

describe('truncate()', () => {
  it('returns string unchanged if under limit', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })
  it('truncates and adds ellipsis', () => {
    expect(truncate('hello world', 5)).toBe('hello...')
  })
})

describe('formatCount()', () => {
  it('returns number as string under 1000', () => {
    expect(formatCount(42)).toBe('42')
    expect(formatCount(999)).toBe('999')
  })
  it('formats thousands with k suffix', () => {
    expect(formatCount(1200)).toBe('1.2k')
    expect(formatCount(10000)).toBe('10.0k')
  })
})

describe('getAvatarUrl()', () => {
  it('returns a valid dicebear URL', () => {
    const url = getAvatarUrl('alice')
    expect(url).toContain('dicebear.com')
    expect(url).toContain('alice')
  })
})
