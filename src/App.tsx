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
    <main>
      <h1>Todo App</h1>
      <TodoInput onAdd={addTodo} />
      {visibleTodos.length > 0 || todos.length === 0 ? (
        <TodoList todos={visibleTodos} onToggle={toggleTodo} onDelete={removeTodo} onEdit={editTodo} />
      ) : <p className="empty-state">No {filter.toLowerCase()} todos.</p>}
      <TodoFooter activeCount={activeCount} completedCount={todos.length - activeCount} filter={filter} onFilterChange={setFilter} onClearCompleted={clearCompleted} />
    </main>
  )
}
