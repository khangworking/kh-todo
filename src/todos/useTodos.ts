import { useEffect, useReducer } from 'react'
import { todoReducer } from './todoReducer'
import type { Todo } from './types'

export const TODOS_STORAGE_KEY = 'todoapp.todos'

function isTodo(value: unknown): value is Todo {
  if (typeof value !== 'object' || value === null) return false
  const todo = value as Record<string, unknown>
  return typeof todo.id === 'string'
    && typeof todo.title === 'string'
    && typeof todo.completed === 'boolean'
    && typeof todo.createdAt === 'number'
    && Number.isFinite(todo.createdAt)
}

function loadTodos(): Todo[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(TODOS_STORAGE_KEY) ?? '[]')
    return Array.isArray(value) && value.every(isTodo) ? value : []
  } catch {
    return []
  }
}

export function useTodos() {
  const [todos, dispatch] = useReducer(todoReducer, undefined, loadTodos)

  useEffect(() => {
    try {
      localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos))
    } catch {
      // Keep the in-memory list usable when browser storage is unavailable or full.
    }
  }, [todos])

  return {
    todos,
    addTodo: (title: string) => dispatch({
      type: 'add',
      todo: { id: crypto.randomUUID(), title, completed: false, createdAt: Date.now() },
    }),
    toggleTodo: (id: string) => dispatch({ type: 'toggle', id }),
    removeTodo: (id: string) => dispatch({ type: 'remove', id }),
    editTodo: (id: string, title: string) => dispatch({ type: 'edit', id, title }),
    clearCompleted: () => dispatch({ type: 'clearCompleted' }),
  }
}
