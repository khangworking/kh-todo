import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'
import App from './App'
import { ACTIVE_PROJECT_STORAGE_KEY, PROJECTS_STORAGE_KEY } from './projects/useProjects'
import { TODOS_STORAGE_KEY } from './todos/useTodos'

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

test('adds, removes, and restores a note after remounting', () => {
  const { unmount } = render(<App />)
  addTodo('Document this')
  fireEvent.click(screen.getByRole('button', { name: 'Add note for Document this' }))
  fireEvent.change(screen.getByRole('textbox', { name: 'Note for Document this' }), { target: { value: '  First line\nSecond line  ' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  expect(screen.getByText(/First line\s+Second line/)).toBeInTheDocument()

  unmount()
  render(<App />)
  expect(screen.getByText(/First line\s+Second line/)).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Edit note for Document this' }))
  fireEvent.change(screen.getByRole('textbox', { name: 'Note for Document this' }), { target: { value: '   ' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  expect(screen.queryByText(/First line\s+Second line/)).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Add note for Document this' })).toBeInTheDocument()
})

test('switches project todo lists and resets the filter to All', () => {
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify([
    { id: 'p1', name: 'Personal', description: '', dueDate: null, createdAt: 1 },
    { id: 'p2', name: 'Work', description: '', dueDate: null, createdAt: 2 },
  ]))
  localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, 'p1')
  localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify([
    { id: 't1', title: 'Personal active', note: '', projectId: 'p1', completed: false, createdAt: 1 },
    { id: 't2', title: 'Work done', note: '', projectId: 'p2', completed: true, createdAt: 2 },
  ]))
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Active' }))
  expect(screen.getByRole('button', { name: 'Active' })).toHaveAttribute('aria-pressed', 'true')
  fireEvent.change(screen.getByRole('combobox', { name: 'Project' }), { target: { value: 'p2' } })
  expect(screen.getByRole('checkbox', { name: 'Work done' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByText('0 items left')).toBeInTheDocument()
})
