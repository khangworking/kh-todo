import type { Todo } from '../todos/types'
import { TodoItem } from './TodoItem'

interface TodoListProps {
  todos: Todo[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit?: (id: string, title: string) => void
  onSetNote: (id: string, note: string) => void
}

export function TodoList({ todos, onToggle, onDelete, onEdit, onSetNote }: TodoListProps) {
  if (todos.length === 0) return <p className="mt-8 text-slate-600 dark:text-slate-400">No todos yet. Add one to get started.</p>

  return (
    <ul className="my-6 list-none p-0" aria-label="Todos">
      {todos.map(todo => <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} onSetNote={onSetNote} />)}
    </ul>
  )
}
