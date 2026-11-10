import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'
import App from '../App'
import { TODOS_STORAGE_KEY } from '../todos/useTodos'

beforeEach(() => {
  localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify([
    { id: '1', title: 'Active task', completed: false, createdAt: 1 },
    { id: '2', title: 'Finished task', completed: true, createdAt: 2 },
  ]))
})

test('filters todos and keeps the remaining counter independent of the filter', () => {
  render(<App />)
  expect(screen.getByText('1 item left')).toBeInTheDocument()
  expect(screen.getAllByRole('checkbox')).toHaveLength(2)
  fireEvent.click(screen.getByRole('button', { name: 'Active' }))
  expect(screen.getByRole('button', { name: 'Active' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('checkbox', { name: 'Active task' })).toBeInTheDocument()
  expect(screen.queryByRole('checkbox', { name: 'Finished task' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Completed' }))
  expect(screen.getByRole('checkbox', { name: 'Finished task' })).toBeInTheDocument()
  expect(screen.queryByRole('checkbox', { name: 'Active task' })).not.toBeInTheDocument()
  expect(screen.getByText('1 item left')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'All' }))
  expect(screen.getAllByRole('checkbox')).toHaveLength(2)
  fireEvent.click(screen.getByRole('checkbox', { name: 'Finished task' }))
  expect(screen.getByText('2 items left')).toBeInTheDocument()
})

test('clears completed todos while filtered and persists the remaining list', () => {
  const { unmount } = render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Completed' }))
  fireEvent.click(screen.getByRole('button', { name: 'Clear completed' }))
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Clear completed' })).toBeDisabled()
  expect(screen.getByText('1 item left')).toBeInTheDocument()
  unmount()
  render(<App />)
  expect(screen.getByRole('checkbox', { name: 'Active task' })).toBeInTheDocument()
  expect(screen.queryByRole('checkbox', { name: 'Finished task' })).not.toBeInTheDocument()
})

test('inline editing updates and persists the title; an empty edit removes it', () => {
  const { unmount } = render(<App />)
  fireEvent.doubleClick(screen.getByText('Active task'))
  fireEvent.change(screen.getByRole('textbox', { name: 'Edit Active task' }), { target: { value: 'Renamed' } })
  fireEvent.keyDown(screen.getByRole('textbox', { name: 'Edit Active task' }), { key: 'Enter' })
  expect(screen.getByRole('checkbox', { name: 'Renamed' })).toBeInTheDocument()
  unmount()
  render(<App />)
  fireEvent.doubleClick(screen.getByText('Renamed'))
  fireEvent.change(screen.getByRole('textbox', { name: 'Edit Renamed' }), { target: { value: '' } })
  fireEvent.blur(screen.getByRole('textbox', { name: 'Edit Renamed' }))
  expect(screen.queryByRole('checkbox', { name: 'Renamed' })).not.toBeInTheDocument()
  expect(screen.getByText('0 items left')).toBeInTheDocument()
})
