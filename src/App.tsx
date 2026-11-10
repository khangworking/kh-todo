import { useState } from 'react'
import { TodoInput } from './components/TodoInput'
import { TodoList } from './components/TodoList'
import { TodoFooter } from './components/TodoFooter'
import type { TodoFilter } from './components/TodoFooter'
import { useTodos } from './todos/useTodos'

export default function App() {
  const { todos, addTodo, toggleTodo, removeTodo, editTodo, clearCompleted } = useTodos()
  const [filter, setFilter] = useState<TodoFilter>('All')
  const activeCount = todos.filter(todo => !todo.completed).length
  const visibleTodos = todos.filter(todo => filter === 'All' || (filter === 'Completed' ? todo.completed : !todo.completed))

  return (
    <main className="mx-auto my-12 max-w-[40rem] px-5">
      <h1 className="mb-8">Todo App</h1>
      <TodoInput onAdd={addTodo} />
      {visibleTodos.length > 0 || todos.length === 0 ? (
        <TodoList todos={visibleTodos} onToggle={toggleTodo} onDelete={removeTodo} onEdit={editTodo} />
      ) : <p className="mt-8 text-slate-600">No {filter.toLowerCase()} todos.</p>}
      <TodoFooter activeCount={activeCount} completedCount={todos.length - activeCount} filter={filter} onFilterChange={setFilter} onClearCompleted={clearCompleted} />
    </main>
  )
}
