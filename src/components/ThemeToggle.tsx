import type { Theme } from '../theme/useTheme'

interface ThemeToggleProps {
  theme: Theme
  onChange: (theme: Theme) => void
}

const OPTIONS: { value: Theme; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

export function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  return (
    <div className="flex flex-wrap gap-1" role="group" aria-label="Theme">
      {OPTIONS.map(option => (
        <button
          key={option.value}
          type="button"
          aria-pressed={theme === option.value}
          onClick={() => onChange(option.value)}
          className="cursor-pointer rounded-md border border-slate-400 bg-white px-3 py-2 text-sm text-slate-900 aria-pressed:border-blue-700 aria-pressed:bg-blue-700 aria-pressed:text-white focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-3 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:aria-pressed:border-blue-500 dark:aria-pressed:bg-blue-600 dark:aria-pressed:text-white dark:focus-visible:outline-blue-400"
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
