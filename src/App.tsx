import { useState } from 'react'
import { TodoInput } from './components/TodoInput'
import { TodoList } from './components/TodoList'
import { TodoFooter } from './components/TodoFooter'
import { ThemeToggle } from './components/ThemeToggle'
import type { TodoFilter } from './components/TodoFooter'
import { useTodos } from './todos/useTodos'
import { useTheme } from './theme/useTheme'

export default function App() {
  const { todos, addTodo, toggleTodo, removeTodo, editTodo, clearCompleted } = useTodos()
  const [filter, setFilter] = useState<TodoFilter>('All')
  const { theme, setTheme } = useTheme()
  const activeCount = todos.filter(todo => !todo.completed).length
  const visibleTodos = todos.filter(todo => filter === 'All' || (filter === 'Completed' ? todo.completed : !todo.completed))

  return (
    <main className="mx-auto my-12 max-w-[40rem] px-5">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1>Todo App</h1>
        <ThemeToggle theme={theme} onChange={setTheme} />
      </header>
      <TodoInput onAdd={addTodo} />
      {visibleTodos.length > 0 || todos.length === 0 ? (
        <TodoList todos={visibleTodos} onToggle={toggleTodo} onDelete={removeTodo} onEdit={editTodo} />
      ) : <p className="mt-8 text-slate-600 dark:text-slate-400">No {filter.toLowerCase()} todos.</p>}
      <TodoFooter activeCount={activeCount} completedCount={todos.length - activeCount} filter={filter} onFilterChange={setFilter} onClearCompleted={clearCompleted} />
    </main>
  )
}
