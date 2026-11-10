import { useState } from 'react'
import type { FormEvent } from 'react'

interface TodoInputProps {
  onAdd: (title: string) => void
}

export function TodoInput({ onAdd }: TodoInputProps) {
  const [title, setTitle] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setTitle('')
  }

  return (
    <form className="todo-input" onSubmit={handleSubmit}>
      <label htmlFor="new-todo">New todo</label>
      <div className="todo-input-row">
        <input
          id="new-todo"
          type="text"
          value={title}
          onChange={event => setTitle(event.target.value)}
          placeholder="What needs to get done?"
          autoComplete="off"
        />
        <button type="submit">Add todo</button>
      </div>
    </form>
  )
}
