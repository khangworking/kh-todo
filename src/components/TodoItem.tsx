import { useRef, useState } from 'react'
import type { Todo } from '../todos/types'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit?: (id: string, title: string) => void
  onSetNote: (id: string, note: string) => void
}

export function TodoItem({ todo, onToggle, onDelete, onEdit, onSetNote }: TodoItemProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.title)
  const [editingNote, setEditingNote] = useState(false)
  const [noteDraft, setNoteDraft] = useState(todo.note)
  const finished = useRef(false)

  function startEditing() {
    if (!onEdit) return
    finished.current = false
    setEditingNote(false)
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

  function startNoteEditing() {
    setNoteDraft(todo.note)
    setEditingNote(true)
  }

  function finishNoteEditing(save: boolean) {
    setEditingNote(false)
    if (save) onSetNote(todo.id, noteDraft)
  }

  return (
    <li className={`flex flex-wrap items-center gap-4 border-b border-slate-300 py-4 dark:border-slate-700${todo.completed ? ' is-completed' : ''}`}>
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
        <div className="min-w-0 flex-1">
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-blue-700 focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-3 dark:accent-blue-500 dark:focus-visible:outline-blue-400" checked={todo.completed} onChange={() => onToggle(todo.id)} />
            <span className={todo.completed ? 'block wrap-anywhere text-slate-500 line-through dark:text-slate-400' : 'block wrap-anywhere'} onDoubleClick={startEditing}>{todo.title}</span>
          </label>
          {todo.note && <p className="mt-1 ml-8 whitespace-pre-wrap wrap-anywhere text-sm text-slate-600 dark:text-slate-400">{todo.note}</p>}
        </div>
      )}
      {onEdit && !editing && <button className="cursor-pointer rounded-md border border-slate-400 bg-white px-3 py-2 text-slate-900 focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-3 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus-visible:outline-blue-400" type="button" aria-label={`Edit ${todo.title}`} onClick={startEditing}>Edit</button>}
      {!editing && <button className="cursor-pointer rounded-md border border-slate-400 bg-white px-3 py-2 text-slate-900 focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-3 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus-visible:outline-blue-400" type="button" aria-label={`${todo.note ? 'Edit' : 'Add'} note for ${todo.title}`} onClick={startNoteEditing}>Note</button>}
      <button className="shrink-0 cursor-pointer rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-red-700 hover:bg-red-100 focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-3 dark:border-slate-700 dark:text-red-400 dark:hover:bg-red-950 dark:focus-visible:outline-blue-400" type="button" aria-label={`Delete ${todo.title}`} onClick={() => onDelete(todo.id)}>
        Delete
      </button>
      {editingNote && (
        <div className="w-full">
          <label className="mb-2 block font-semibold" htmlFor={`note-${todo.id}`}>Note for {todo.title}</label>
          <textarea
            id={`note-${todo.id}`}
            autoFocus
            rows={4}
            value={noteDraft}
            onChange={event => setNoteDraft(event.target.value)}
            onKeyDown={event => {
              if (event.nativeEvent.isComposing) return
              if (event.key === 'Escape') {
                event.preventDefault()
                finishNoteEditing(false)
              } else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                event.preventDefault()
                finishNoteEditing(true)
              }
            }}
            className="w-full resize-y rounded-md border border-slate-400 bg-white p-3 text-slate-900 focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-3 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus-visible:outline-blue-400"
          />
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => finishNoteEditing(true)} className="cursor-pointer rounded-md bg-blue-700 px-4 py-2 text-white hover:bg-blue-800 focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-3 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus-visible:outline-blue-400">Save</button>
            <button type="button" onClick={() => finishNoteEditing(false)} className="cursor-pointer rounded-md border border-slate-400 bg-white px-4 py-2 text-slate-900 focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-3 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus-visible:outline-blue-400">Cancel</button>
          </div>
        </div>
      )}
    </li>
  )
}
