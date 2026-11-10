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
    <footer className="todo-footer">
      <span aria-live="polite">{activeCount} {activeCount === 1 ? 'item' : 'items'} left</span>
      <div className="todo-filters" role="group" aria-label="Filter todos">
        {(['All', 'Active', 'Completed'] as const).map(value => (
          <button key={value} type="button" aria-pressed={filter === value} onClick={() => onFilterChange(value)}>{value}</button>
        ))}
      </div>
      <button type="button" disabled={completedCount === 0} onClick={onClearCompleted}>Clear completed</button>
    </footer>
  )
}
