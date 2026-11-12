import { useState } from 'react'
import { TodoInput } from './components/TodoInput'
import { TodoList } from './components/TodoList'
import { TodoFooter } from './components/TodoFooter'
import { ThemeToggle } from './components/ThemeToggle'
import { ProjectPanel } from './components/ProjectPanel'
import type { TodoFilter } from './components/TodoFooter'
import { useProjects } from './projects/useProjects'
import { useTheme } from './theme/useTheme'

export default function App() {
  const { projects, activeProject, todos, createProject, updateProject, deleteProject, selectProject, addTodo, toggleTodo, removeTodo, editTodo, setNote, clearCompleted } = useProjects()
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
      <ProjectPanel projects={projects} activeProject={activeProject} todoCount={todos.length} incompleteCount={activeCount} onSelect={selectProject} onCreate={createProject} onUpdate={updateProject} onDelete={deleteProject} onProjectChange={() => setFilter('All')} />
      <TodoInput onAdd={addTodo} />
      {visibleTodos.length > 0 || todos.length === 0 ? (
        <TodoList todos={visibleTodos} onToggle={toggleTodo} onDelete={removeTodo} onEdit={editTodo} onSetNote={setNote} />
      ) : <p className="mt-8 text-slate-600 dark:text-slate-400">No {filter.toLowerCase()} todos.</p>}
      <TodoFooter activeCount={activeCount} completedCount={todos.length - activeCount} filter={filter} onFilterChange={setFilter} onClearCompleted={clearCompleted} />
    </main>
  )
}
