import type { Todo } from '../todos/types'
import { TodoItem } from './TodoItem'

interface TodoListProps {
  todos: Todo[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) return <p className="empty-state">No todos yet. Add one to get started.</p>

  return (
    <ul className="todo-list" aria-label="Todos">
      {todos.map(todo => <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />)}
    </ul>
  )
}
