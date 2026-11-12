import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { TodoItem } from './TodoItem'

function setup(note = '') {
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  const onSetNote = vi.fn()
  render(<ul><TodoItem todo={{ id: '1', title: 'Original', note, projectId: 'project-1', completed: false, createdAt: 1 }} onToggle={vi.fn()} onEdit={onEdit} onDelete={onDelete} onSetNote={onSetNote} /></ul>)
  fireEvent.doubleClick(screen.getByText('Original'))
  return { onEdit, onDelete, onSetNote, input: screen.getByRole('textbox', { name: 'Edit Original' }) }
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

test('adds a note and supports Ctrl+Enter to save', () => {
  const onSetNote = vi.fn()
  render(<ul><TodoItem todo={{ id: '1', title: 'Original', note: '', projectId: 'project-1', completed: false, createdAt: 1 }} onToggle={vi.fn()} onDelete={vi.fn()} onSetNote={onSetNote} /></ul>)
  fireEvent.click(screen.getByRole('button', { name: 'Add note for Original' }))
  const textarea = screen.getByRole('textbox', { name: 'Note for Original' })
  expect(textarea).toHaveFocus()
  fireEvent.change(textarea, { target: { value: 'A new note' } })
  fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true })
  expect(onSetNote).toHaveBeenCalledExactlyOnceWith('1', 'A new note')
  expect(screen.queryByRole('textbox', { name: 'Note for Original' })).not.toBeInTheDocument()
})

test('edits an existing note and saves with the Save button', () => {
  const onSetNote = vi.fn()
  render(<ul><TodoItem todo={{ id: '1', title: 'Original', note: 'Old note', projectId: 'project-1', completed: false, createdAt: 1 }} onToggle={vi.fn()} onDelete={vi.fn()} onSetNote={onSetNote} /></ul>)
  expect(screen.getByText('Old note')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Edit note for Original' }))
  fireEvent.change(screen.getByRole('textbox', { name: 'Note for Original' }), { target: { value: 'Updated note' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  expect(onSetNote).toHaveBeenCalledExactlyOnceWith('1', 'Updated note')
})

test('keeps the note outside the checkbox label', () => {
  const onToggle = vi.fn()
  render(<ul><TodoItem todo={{ id: '1', title: 'Original', note: 'Extra details', projectId: 'project-1', completed: false, createdAt: 1 }} onToggle={onToggle} onDelete={vi.fn()} onSetNote={vi.fn()} /></ul>)
  expect(screen.getByRole('checkbox', { name: 'Original' })).toBeInTheDocument()
  expect(screen.queryByRole('checkbox', { name: 'Original Extra details' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByText('Extra details'))
  expect(onToggle).not.toHaveBeenCalled()
})

test.each(['Cancel', 'Escape'])('%s cancels note changes', trigger => {
  const onSetNote = vi.fn()
  render(<ul><TodoItem todo={{ id: '1', title: 'Original', note: 'Saved note', projectId: 'project-1', completed: false, createdAt: 1 }} onToggle={vi.fn()} onDelete={vi.fn()} onSetNote={onSetNote} /></ul>)
  fireEvent.click(screen.getByRole('button', { name: 'Edit note for Original' }))
  const textarea = screen.getByRole('textbox', { name: 'Note for Original' })
  fireEvent.change(textarea, { target: { value: 'Discard me' } })
  if (trigger === 'Escape') fireEvent.keyDown(textarea, { key: 'Escape' })
  else fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  expect(onSetNote).not.toHaveBeenCalled()
  expect(screen.queryByRole('textbox', { name: 'Note for Original' })).not.toBeInTheDocument()
})

test('saving a whitespace-only note requests note removal', () => {
  const onSetNote = vi.fn()
  render(<ul><TodoItem todo={{ id: '1', title: 'Original', note: 'Saved note', projectId: 'project-1', completed: false, createdAt: 1 }} onToggle={vi.fn()} onDelete={vi.fn()} onSetNote={onSetNote} /></ul>)
  fireEvent.click(screen.getByRole('button', { name: 'Edit note for Original' }))
  fireEvent.change(screen.getByRole('textbox', { name: 'Note for Original' }), { target: { value: '   ' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  expect(onSetNote).toHaveBeenCalledExactlyOnceWith('1', '   ')
})
