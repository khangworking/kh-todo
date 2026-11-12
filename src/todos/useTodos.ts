import type { Todo } from './types'

export const TODOS_STORAGE_KEY = 'todoapp.todos'

type StoredTodo = Omit<Todo, 'note' | 'projectId'> & { note?: unknown; projectId?: unknown }

function isTodo(value: unknown): value is StoredTodo {
  if (typeof value !== 'object' || value === null) return false
  const todo = value as Record<string, unknown>
  return typeof todo.id === 'string'
    && typeof todo.title === 'string'
    && typeof todo.completed === 'boolean'
    && typeof todo.createdAt === 'number'
    && Number.isFinite(todo.createdAt)
}

export function loadTodos(validProjectIds: ReadonlySet<string>, fallbackProjectId: string): Todo[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(TODOS_STORAGE_KEY) ?? '[]')
    if (!Array.isArray(value) || !value.every(isTodo)) return []
    return value.map(todo => ({
      ...todo,
      note: typeof todo.note === 'string' ? todo.note : '',
      projectId: typeof todo.projectId === 'string' && validProjectIds.has(todo.projectId)
        ? todo.projectId
        : fallbackProjectId,
    }))
  } catch {
    return []
  }
}
