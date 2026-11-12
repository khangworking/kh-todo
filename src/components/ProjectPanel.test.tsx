import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import type { Project } from '../projects/types'
import { ProjectPanel } from './ProjectPanel'
import { formatProjectDueDate, isProjectOverdue } from './projectDates'

const first: Project = { id: 'p1', name: 'Personal', description: 'Line one\nLine two', dueDate: '2026-11-30', createdAt: 1 }
const second: Project = { id: 'p2', name: 'Work', description: '', dueDate: null, createdAt: 2 }

afterEach(() => vi.restoreAllMocks())

function setup(projects = [first, second], activeProject = first) {
  const onSelect = vi.fn()
  const onCreate = vi.fn(() => 'p3')
  const onUpdate = vi.fn()
  const onDelete = vi.fn()
  const onProjectChange = vi.fn()
  render(<ProjectPanel projects={projects} activeProject={activeProject} todoCount={2} incompleteCount={1} onSelect={onSelect} onCreate={onCreate} onUpdate={onUpdate} onDelete={onDelete} onProjectChange={onProjectChange} />)
  return { onSelect, onCreate, onUpdate, onDelete, onProjectChange }
}

test('switches projects using the labelled select', () => {
  const { onSelect, onProjectChange } = setup()
  fireEvent.change(screen.getByRole('combobox', { name: 'Project' }), { target: { value: second.id } })
  expect(onSelect).toHaveBeenCalledExactlyOnceWith(second.id)
  expect(onProjectChange).toHaveBeenCalledOnce()
})

test('creates a project, validates its name, and selects it', () => {
  const { onCreate, onSelect } = setup()
  fireEvent.click(screen.getByRole('button', { name: 'New project' }))
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  expect(screen.getByRole('alert')).toHaveTextContent('Project name is required.')
  expect(onCreate).not.toHaveBeenCalled()

  fireEvent.change(screen.getByRole('textbox', { name: 'Project name' }), { target: { value: 'New project' } })
  fireEvent.change(screen.getByRole('textbox', { name: 'Description' }), { target: { value: 'Details' } })
  fireEvent.change(screen.getByLabelText('Due date'), { target: { value: '2027-01-15' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  expect(onCreate).toHaveBeenCalledExactlyOnceWith('New project', 'Details', '2027-01-15')
  expect(onSelect).toHaveBeenCalledExactlyOnceWith('p3')
})

test('edits project fields and allows clearing the due date', () => {
  const { onUpdate } = setup()
  fireEvent.click(screen.getByRole('button', { name: 'Edit project' }))
  expect(screen.getByRole('textbox', { name: 'Project name' })).toHaveValue('Personal')
  fireEvent.change(screen.getByRole('textbox', { name: 'Project name' }), { target: { value: 'Home' } })
  fireEvent.change(screen.getByLabelText('Due date'), { target: { value: '' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  expect(onUpdate).toHaveBeenCalledExactlyOnceWith(first.id, {
    name: 'Home',
    description: first.description,
    dueDate: null,
  })
})

test('confirms project deletion with the number of affected todos', () => {
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  const { onDelete } = setup()
  fireEvent.click(screen.getByRole('button', { name: 'Delete project' }))
  expect(window.confirm).toHaveBeenCalledWith('Delete “Personal” and its 2 todos?')
  expect(onDelete).toHaveBeenCalledExactlyOnceWith(first.id)
})

test('disables deletion when only one project remains', () => {
  setup([first], first)
  expect(screen.getByRole('button', { name: 'Delete project' })).toBeDisabled()
})

test('renders the Overdue label for a past due project with incomplete todos', () => {
  const overdueProject = { ...first, dueDate: '2000-01-01' }
  setup([overdueProject], overdueProject)
  expect(screen.getByText('Overdue')).toBeInTheDocument()
})

test('shows project details and computes overdue using local calendar dates', () => {
  setup()
  expect(screen.getByText(/Line one\s+Line two/)).toBeInTheDocument()
  expect(screen.getByText(`Due ${formatProjectDueDate(first.dueDate!)}`)).toBeInTheDocument()
  expect(isProjectOverdue('2026-11-11', true, new Date(2026, 10, 12, 23, 30))).toBe(true)
  expect(isProjectOverdue('2026-11-12', true, new Date(2026, 10, 12, 23, 30))).toBe(false)
  expect(isProjectOverdue('2026-11-11', false, new Date(2026, 10, 12))).toBe(false)
})
