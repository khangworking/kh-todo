export type TodoFilter = 'All' | 'Active' | 'Completed'

interface TodoFooterProps {
  activeCount: number
  completedCount: number
  filter: TodoFilter
  onFilterChange: (filter: TodoFilter) => void
  onClearCompleted: () => void
}

export function TodoFooter({ activeCount, completedCount, filter, onFilterChange, onClearCompleted }: TodoFooterProps) {
  return (
    <footer className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm">
      <span aria-live="polite">{activeCount} {activeCount === 1 ? 'item' : 'items'} left</span>
      <div className="flex gap-1" role="group" aria-label="Filter todos">
        {(['All', 'Active', 'Completed'] as const).map(value => (
          <button key={value} type="button" aria-pressed={filter === value} onClick={() => onFilterChange(value)} className="cursor-pointer rounded-md border border-slate-400 bg-white px-3 py-2 text-slate-900 aria-pressed:border-blue-700 aria-pressed:bg-blue-700 aria-pressed:text-white focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-3 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:aria-pressed:border-blue-500 dark:aria-pressed:bg-blue-600 dark:aria-pressed:text-white dark:focus-visible:outline-blue-400">{value}</button>
        ))}
      </div>
      <button type="button" disabled={completedCount === 0} onClick={onClearCompleted} className="cursor-pointer rounded-md border border-slate-400 bg-white px-3 py-2 text-slate-900 disabled:cursor-default disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-3 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus-visible:outline-blue-400">Clear completed</button>
    </footer>
  )
}
