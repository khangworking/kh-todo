export interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: number
}

export type TodoAction =
  | { type: 'add'; todo: Todo }
  | { type: 'toggle'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'edit'; id: string; title: string }
  | { type: 'clearCompleted' }
