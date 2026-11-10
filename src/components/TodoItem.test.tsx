import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { TodoItem } from './TodoItem'

function setup() {
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  render(<ul><TodoItem todo={{ id: '1', title: 'Original', completed: false, createdAt: 1 }} onToggle={vi.fn()} onEdit={onEdit} onDelete={onDelete} /></ul>)
  fireEvent.doubleClick(screen.getByText('Original'))
  return { onEdit, onDelete, input: screen.getByRole('textbox', { name: 'Edit Original' }) }
}

test.each(['Enter', 'blur'])('saves a trimmed title on %s', trigger => {
  const { input, onEdit, onDelete } = setup()
  expect(input).toHaveFocus()
  fireEvent.change(input, { target: { value: '  Updated  ' } })
  if (trigger === 'blur') fireEvent.blur(input)
  else fireEvent.keyDown(input, { key: trigger })
  expect(onEdit).toHaveBeenCalledExactlyOnceWith('1', 'Updated')
  expect(onDelete).not.toHaveBeenCalled()
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
})

test('Escape cancels and the next edit starts from the saved title', () => {
  const { input, onEdit, onDelete } = setup()
  fireEvent.change(input, { target: { value: 'Discard' } })
  fireEvent.keyDown(input, { key: 'Escape' })
  fireEvent.blur(input)
  expect(onEdit).not.toHaveBeenCalled()
  expect(onDelete).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Edit Original' }))
  expect(screen.getByRole('textbox')).toHaveValue('Original')
})

test.each(['Enter', 'blur'])('deletes whitespace-only titles on %s', trigger => {
  const { input, onEdit, onDelete } = setup()
  fireEvent.change(input, { target: { value: '   ' } })
  if (trigger === 'blur') fireEvent.blur(input)
  else fireEvent.keyDown(input, { key: trigger })
  expect(onDelete).toHaveBeenCalledExactlyOnceWith('1')
  expect(onEdit).not.toHaveBeenCalled()
})
