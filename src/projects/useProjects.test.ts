import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { TODOS_STORAGE_KEY } from '../todos/useTodos'
import { ACTIVE_PROJECT_STORAGE_KEY, PROJECTS_STORAGE_KEY, useProjects } from './useProjects'
import type { Project } from './types'

const first: Project = { id: 'p1', name: 'First', description: '', dueDate: null, createdAt: 1 }
const second: Project = { id: 'p2', name: 'Second', description: 'Details', dueDate: '2026-12-31', createdAt: 2 }

beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())

test('migrates legacy todos with notes into a default My Todos project', () => {
  localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify([
    { id: 't1', title: 'Legacy', note: 'Keep this', completed: false, createdAt: 1 },
  ]))
  const { result } = renderHook(useProjects)
  expect(result.current.projects).toEqual([
    expect.objectContaining({ name: 'My Todos', description: '', dueDate: null }),
  ])
  expect(result.current.activeProjectId).toBe(result.current.projects[0].id)
  expect(result.current.todos).toEqual([
    { id: 't1', title: 'Legacy', note: 'Keep this', projectId: result.current.activeProjectId, completed: false, createdAt: 1 },
  ])
})

test('normalizes missing and non-string legacy notes without losing todos', () => {
  localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify([
    { id: 't1', title: 'Missing note', completed: false, createdAt: 1 },
    { id: 't2', title: 'Invalid note', note: 123, completed: true, createdAt: 2 },
  ]))
  const { result } = renderHook(useProjects)
  expect(result.current.todos.map(todo => ({ title: todo.title, note: todo.note }))).toEqual([
    { title: 'Missing note', note: '' },
    { title: 'Invalid note', note: '' },
  ])
})

test.each(['{broken', 'null', '{}', '[null]', '[{"id":"bad"}]'])('falls back to an empty todo list for invalid legacy data: %s', value => {
  localStorage.setItem(TODOS_STORAGE_KEY, value)
  const { result } = renderHook(useProjects)
  expect(result.current.todos).toEqual([])
})

test('keeps the workspace usable when storage access throws', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Denied') })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Full') })
  const { result } = renderHook(useProjects)
  expect(result.current.projects).toHaveLength(1)
  act(() => result.current.addTodo('In memory'))
  expect(result.current.todos[0].title).toBe('In Memory')
})

test('falls back to the first project when the saved active id is invalid', () => {
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify([first, second]))
  localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, 'missing')
  const { result } = renderHook(useProjects)
  expect(result.current.activeProjectId).toBe(first.id)
  expect(result.current.activeProject).toEqual(first)
})

test('assigns new todos to and filters them by the active project', () => {
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify([first, second]))
  localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, first.id)
  const { result } = renderHook(useProjects)
  act(() => result.current.addTodo('First todo'))
  expect(result.current.todos.map(todo => todo.title)).toEqual(['First Todo'])
  expect(result.current.todos[0].projectId).toBe(first.id)

  act(() => result.current.selectProject(second.id))
  expect(result.current.todos).toEqual([])
  act(() => result.current.addTodo('Second todo'))
  expect(result.current.todos.map(todo => todo.title)).toEqual(['Second Todo'])
  expect(result.current.allTodos).toHaveLength(2)
})

test('titleizes new and edited todos without changing notes or project names', () => {
  const { result } = renderHook(useProjects)
  act(() => result.current.addTodo('fix API bug'))
  expect(result.current.todos[0].title).toBe('Fix API Bug')
  act(() => result.current.setNote(result.current.todos[0].id, 'note stays lowercase'))
  act(() => result.current.editTodo(result.current.todos[0].id, 'mua sữa'))
  expect(result.current.todos[0].title).toBe('Mua Sữa')
  expect(result.current.todos[0].note).toBe('note stays lowercase')
  expect(result.current.activeProject.name).toBe('My Todos')
})

test('does not titleize existing stored todos', () => {
  localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify([
    { id: 't1', title: 'keep my old casing', note: '', completed: false, createdAt: 1 },
  ]))
  const { result } = renderHook(useProjects)
  expect(result.current.todos[0].title).toBe('keep my old casing')
})

test('clearCompleted affects only the active project', () => {
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify([first, second]))
  localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify([
    { id: 't1', title: 'First done', note: '', projectId: first.id, completed: true, createdAt: 1 },
    { id: 't2', title: 'Second done', note: '', projectId: second.id, completed: true, createdAt: 2 },
  ]))
  const { result } = renderHook(useProjects)
  act(() => result.current.clearCompleted())
  expect(result.current.allTodos.map(todo => todo.id)).toEqual(['t2'])
})

test('deleting a project removes its todos but cannot delete the last project', () => {
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify([first, second]))
  localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify([
    { id: 't1', title: 'First todo', note: '', projectId: first.id, completed: false, createdAt: 1 },
    { id: 't2', title: 'Second todo', note: '', projectId: second.id, completed: false, createdAt: 2 },
  ]))
  const { result } = renderHook(useProjects)
  act(() => result.current.deleteProject(first.id))
  expect(result.current.projects).toEqual([second])
  expect(result.current.allTodos.map(todo => todo.id)).toEqual(['t2'])
  act(() => result.current.deleteProject(second.id))
  expect(result.current.projects).toEqual([second])
  expect(result.current.allTodos.map(todo => todo.id)).toEqual(['t2'])
})

test('persists project CRUD, selection, and todos across remounts', () => {
  const { result, unmount } = renderHook(useProjects)
  let projectId = ''
  act(() => { projectId = result.current.createProject('  Work  ', 'Client tasks', '2026-12-31')! })
  act(() => result.current.selectProject(projectId))
  act(() => result.current.updateProject(projectId, { description: 'Updated' }))
  act(() => result.current.addTodo('Ship it'))
  expect(result.current.activeProject).toEqual(expect.objectContaining({ id: projectId, name: 'Work', description: 'Updated' }))
  unmount()

  const restored = renderHook(useProjects)
  expect(restored.result.current.activeProjectId).toBe(projectId)
  expect(restored.result.current.todos.map(todo => todo.title)).toEqual(['Ship It'])
})
