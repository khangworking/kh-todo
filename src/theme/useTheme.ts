import { useEffect, useState } from 'react'

export type Theme = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'theme'

function readStoredTheme(): Theme {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === 'light' || value === 'dark' || value === 'system') return value
  } catch {
    // localStorage may be unavailable (e.g. private mode); fall back to system.
  }
  return 'system'
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme)

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && media.matches)
      document.documentElement.classList.toggle('dark', dark)
      document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
    }

    apply()

    if (theme === 'system') {
      media.addEventListener('change', apply)
      return () => media.removeEventListener('change', apply)
    }
  }, [theme])

  const setTheme = (next: Theme) => {
    setThemeState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore storage errors
    }
  }

  return { theme, setTheme }
}
