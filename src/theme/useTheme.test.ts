import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { useTheme } from './useTheme'

const STORAGE_KEY = 'theme'

type Listener = (event: Event) => void

function createMatchMedia(initialMatches = false) {
  const listeners = new Set<Listener>()
  const mql = {
    matches: initialMatches,
    media: '(prefers-color-scheme: dark)',
    onchange: null as Listener | null,
    addEventListener: (type: string, listener: Listener) => {
      if (type === 'change') listeners.add(listener)
    },
    removeEventListener: (type: string, listener: Listener) => {
      if (type === 'change') listeners.delete(listener)
    },
    addListener: (listener: Listener) => listeners.add(listener),
    removeListener: (listener: Listener) => listeners.delete(listener),
    dispatchEvent: (event: Event) => {
      listeners.forEach(listener => listener(event))
      return true
    },
  }
  return {
    mql: mql as unknown as MediaQueryList,
    setMatches(matches: boolean) {
      mql.matches = matches
      mql.dispatchEvent(new Event('change'))
    },
  }
}

let matchMedia: ReturnType<typeof createMatchMedia>

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
  document.documentElement.style.colorScheme = ''
  matchMedia = createMatchMedia(false)
  window.matchMedia = vi.fn(() => matchMedia.mql) as unknown as typeof window.matchMedia
})

describe('useTheme', () => {
  test('defaults to system', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('system')
  })

  test('applies the dark class and color-scheme when the system prefers dark', () => {
    matchMedia.setMatches(true)
    renderHook(() => useTheme())
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  test('stays light when the system prefers light', () => {
    renderHook(() => useTheme())
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.style.colorScheme).toBe('light')
  })

  test('reacts to the system preference changing while in system mode', () => {
    renderHook(() => useTheme())
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    matchMedia.setMatches(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    matchMedia.setMatches(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  test('setTheme applies and persists the choice', () => {
    const { result } = renderHook(() => useTheme())
    act(() => result.current.setTheme('dark'))
    expect(result.current.theme).toBe('dark')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  test('a manual light choice overrides a dark system preference', () => {
    matchMedia.setMatches(true)
    const { result } = renderHook(() => useTheme())
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    act(() => result.current.setTheme('light'))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  test('restores a persisted choice on mount', () => {
    localStorage.setItem(STORAGE_KEY, 'dark')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
