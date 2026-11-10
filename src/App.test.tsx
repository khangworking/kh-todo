import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'
import App from './App'

beforeEach(() => localStorage.clear())

function addTodo(title: string) {
  fireEvent.change(screen.getByRole('textbox', { name: 'New todo' }), { target: { value: title } })
  fireEvent.click(screen.getByRole('button', { name: 'Add todo' }))
}

test('renders the Todo App heading and empty state', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: 'Todo App', level: 1 })).toBeInTheDocument()
  expect(screen.getByText('No todos yet. Add one to get started.')).toBeInTheDocument()
})

test('adds trimmed titles and clears the input', () => {
  render(<App />)
  addTodo('  Buy milk  ')
  expect(screen.getByRole('checkbox', { name: 'Buy milk' })).not.toBeChecked()
  expect(screen.getByRole('textbox', { name: 'New todo' })).toHaveValue('')
  expect(screen.queryByText('No todos yet. Add one to get started.')).not.toBeInTheDocument()
})

test('rejects empty and whitespace-only input', () => {
  render(<App />)
  addTodo('')
  addTodo('   ')
  expect(screen.queryByRole('list')).not.toBeInTheDocument()
})

test('toggles completion in both directions and deletes only the selected todo', () => {
  render(<App />)
  addTodo('Buy milk')
  addTodo('Read book')
  const checkbox = screen.getByRole('checkbox', { name: 'Buy milk' })
  fireEvent.click(checkbox)
  expect(checkbox).toBeChecked()
  expect(screen.getByText('Buy milk')).toHaveClass('line-through')
  fireEvent.click(checkbox)
  expect(checkbox).not.toBeChecked()
  expect(screen.getByText('Buy milk')).not.toHaveClass('line-through')
  fireEvent.click(screen.getByRole('button', { name: 'Delete Buy milk' }))
  expect(screen.queryByRole('checkbox', { name: 'Buy milk' })).not.toBeInTheDocument()
  expect(screen.getByRole('checkbox', { name: 'Read book' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Delete Read book' }))
  expect(screen.getByText('No todos yet. Add one to get started.')).toBeInTheDocument()
})

test('restores titles and completion after remounting', () => {
  const { unmount } = render(<App />)
  addTodo('Remember me')
  fireEvent.click(screen.getByRole('checkbox', { name: 'Remember me' }))
  unmount()
  render(<App />)
  expect(screen.getByRole('checkbox', { name: 'Remember me' })).toBeChecked()
})
