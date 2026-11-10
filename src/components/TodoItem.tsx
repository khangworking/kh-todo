import { useRef, useState } from 'react'
import type { Todo } from '../todos/types'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit?: (id: string, title: string) => void
}

export function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.title)
  const finished = useRef(false)

  function startEditing() {
    if (!onEdit) return
    finished.current = false
    setDraft(todo.title)
    setEditing(true)
  }

  function finishEditing(save: boolean) {
    if (finished.current) return
    finished.current = true
    setEditing(false)
    if (!save) return
    const title = draft.trim()
    if (title) onEdit?.(todo.id, title)
    else onDelete(todo.id)
  }

  return (
    <li className={`todo-item${todo.completed ? ' is-completed' : ''}`}>
      {editing ? (
        <input
          className="todo-edit"
          aria-label={`Edit ${todo.title}`}
          autoFocus
          value={draft}
          onChange={event => setDraft(event.target.value)}
          onFocus={event => event.target.select()}
          onBlur={() => finishEditing(true)}
          onKeyDown={event => {
            if (event.nativeEvent.isComposing) return
            if (event.key === 'Enter' || event.key === 'Escape') {
              event.preventDefault()
              finishEditing(event.key === 'Enter')
            }
          }}
        />
      ) : (
        <label className="todo-label">
          <input type="checkbox" checked={todo.completed} onChange={() => onToggle(todo.id)} />
          <span className="todo-title" onDoubleClick={startEditing}>{todo.title}</span>
        </label>
      )}
      {onEdit && !editing && <button className="edit-button" type="button" aria-label={`Edit ${todo.title}`} onClick={startEditing}>Edit</button>}
      <button className="delete-button" type="button" aria-label={`Delete ${todo.title}`} onClick={() => onDelete(todo.id)}>
        Delete
      </button>
    </li>
  )
}
