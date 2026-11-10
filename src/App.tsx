import { TodoInput } from './components/TodoInput'
import { TodoList } from './components/TodoList'
import { useTodos } from './todos/useTodos'

export default function App() {
  const { todos, addTodo, toggleTodo, removeTodo } = useTodos()

  return (
    <main>
      <h1>Todo App</h1>
      <TodoInput onAdd={addTodo} />
      <TodoList todos={todos} onToggle={toggleTodo} onDelete={removeTodo} />
    </main>
  )
}
