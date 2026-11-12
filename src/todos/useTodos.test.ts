import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { TODOS_STORAGE_KEY, useTodos } from './useTodos'

const saved = [{ id: 'saved', title: 'Saved', completed: true, createdAt: 123 }]

beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())

test('starts empty when storage is missing', () => {
  const { result } = renderHook(useTodos)
  expect(result.current.todos).toEqual([])
})

test('loads old saved todos without losing them and defaults missing notes to empty', () => {
  localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(saved))
  const { result } = renderHook(useTodos)
  expect(result.current.todos).toEqual([{ ...saved[0], note: '', projectId: 'default' }])
})

test('normalizes non-string saved notes without losing the todo', () => {
  localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify([{ ...saved[0], note: 123 }]))
  const { result } = renderHook(useTodos)
  expect(result.current.todos).toEqual([{ ...saved[0], note: '', projectId: 'default' }])
})

test.each(['{broken', 'null', '{}', '[null]', '[{"id":"bad"}]',
  '[{"id":"1","title":"bad","completed":false,"createdAt":"123"}]',
])('falls back to empty for invalid data: %s', (value) => {
  localStorage.setItem(TODOS_STORAGE_KEY, value)
  const { result } = renderHook(useTodos)
  expect(result.current.todos).toEqual([])
})

test('persists each operation and restores the list after remounting', () => {
  const { result, unmount } = renderHook(useTodos)
  const expectPersisted = () => {
    expect(JSON.parse(localStorage.getItem(TODOS_STORAGE_KEY)!)).toEqual(result.current.todos)
  }
  act(() => result.current.addTodo('First'))
  const first = result.current.todos[0]
  expect(first).toEqual({ id: expect.any(String), title: 'First', note: '', projectId: 'default', completed: false, createdAt: expect.any(Number) })
  expectPersisted()
  act(() => result.current.addTodo('Second'))
  expect(result.current.todos[1].id).not.toBe(first.id)
  expectPersisted()
  act(() => result.current.editTodo(first.id, 'Edited'))
  expect(result.current.todos[0].title).toBe('Edited')
  expectPersisted()
  act(() => result.current.setNote(first.id, '  Remember this  '))
  expect(result.current.todos[0].note).toBe('Remember this')
  expectPersisted()
  act(() => result.current.toggleTodo(first.id))
  expect(result.current.todos[0].completed).toBe(true)
  expectPersisted()
  act(() => result.current.clearCompleted())
  expect(result.current.todos.map(todo => todo.title)).toEqual(['Second'])
  expectPersisted()
  const remaining = result.current.todos
  unmount()
  const restored = renderHook(useTodos)
  expect(restored.result.current.todos).toEqual(remaining)
  act(() => restored.result.current.removeTodo(remaining[0].id))
  expect(restored.result.current.todos).toEqual([])
  expect(localStorage.getItem(TODOS_STORAGE_KEY)).toBe('[]')
})

test('keeps state usable when storage access throws', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Denied') })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Full') })
  const { result } = renderHook(useTodos)
  expect(result.current.todos).toEqual([])
  act(() => result.current.addTodo('In memory'))
  expect(result.current.todos[0].title).toBe('In memory')
})
