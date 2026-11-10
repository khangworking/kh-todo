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
          <button key={value} type="button" aria-pressed={filter === value} onClick={() => onFilterChange(value)} className="cursor-pointer rounded-md border border-slate-400 bg-white px-3 py-2 aria-pressed:border-blue-700 aria-pressed:bg-blue-700 aria-pressed:text-white focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-3">{value}</button>
        ))}
      </div>
      <button type="button" disabled={completedCount === 0} onClick={onClearCompleted} className="cursor-pointer rounded-md border border-slate-400 bg-white px-3 py-2 disabled:cursor-default disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-3">Clear completed</button>
    </footer>
  )
}
