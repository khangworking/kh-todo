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
    <form onSubmit={handleSubmit}>
      <label htmlFor="new-todo" className="mb-2 block font-semibold">New todo</label>
      <div className="flex gap-3">
        <input
          id="new-todo"
          type="text"
          value={title}
          onChange={event => setTitle(event.target.value)}
          placeholder="What needs to get done?"
          autoComplete="off"
          className="min-w-0 flex-1 rounded-lg border border-slate-400 bg-white p-3 text-slate-900 focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-3 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus-visible:outline-blue-400"
        />
        <button type="submit" className="cursor-pointer rounded-lg bg-blue-700 px-4 py-3 text-white hover:bg-blue-800 focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-3 dark:focus-visible:outline-blue-400">Add todo</button>
      </div>
    </form>
  )
}
