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
    <li className={`flex items-center gap-4 border-b border-slate-300 py-4 dark:border-slate-700${todo.completed ? ' is-completed' : ''}`}>
      {editing ? (
        <input
          className="min-w-0 flex-1 rounded-md border border-slate-400 bg-white p-2 text-slate-900 focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-3 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus-visible:outline-blue-400"
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
        <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
          <input type="checkbox" className="h-5 w-5 shrink-0 accent-blue-700 focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-3 dark:accent-blue-500 dark:focus-visible:outline-blue-400" checked={todo.completed} onChange={() => onToggle(todo.id)} />
          <span className={todo.completed ? 'wrap-anywhere text-slate-500 line-through dark:text-slate-400' : 'wrap-anywhere'} onDoubleClick={startEditing}>{todo.title}</span>
        </label>
      )}
      {onEdit && !editing && <button className="cursor-pointer rounded-md border border-slate-400 bg-white px-3 py-2 text-slate-900 focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-3 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus-visible:outline-blue-400" type="button" aria-label={`Edit ${todo.title}`} onClick={startEditing}>Edit</button>}
      <button className="shrink-0 cursor-pointer rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-red-700 hover:bg-red-100 focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-3 dark:border-slate-700 dark:text-red-400 dark:hover:bg-red-950 dark:focus-visible:outline-blue-400" type="button" aria-label={`Delete ${todo.title}`} onClick={() => onDelete(todo.id)}>
        Delete
      </button>
    </li>
  )
}
