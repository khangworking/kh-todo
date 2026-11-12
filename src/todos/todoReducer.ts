import type { Todo, TodoAction } from './types'

export function todoReducer(todos: Todo[], action: TodoAction): Todo[] {
  switch (action.type) {
    case 'add':
      return [...todos, action.todo]
    case 'toggle':
      return todos.map(todo => todo.id === action.id ? { ...todo, completed: !todo.completed } : todo)
    case 'remove':
      return todos.filter(todo => todo.id !== action.id)
    case 'edit':
      return todos.map(todo => todo.id === action.id ? { ...todo, title: action.title } : todo)
    case 'setNote':
      return todos.map(todo => todo.id === action.id ? { ...todo, note: action.note.trim() } : todo)
    case 'clearCompleted':
      return todos.filter(todo => !todo.completed || (action.projectId !== undefined && todo.projectId !== action.projectId))
  }
}
