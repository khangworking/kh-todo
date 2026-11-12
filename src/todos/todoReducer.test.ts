import { expect, test } from 'vitest'
import { todoReducer } from './todoReducer'
import type { Todo } from './types'

const first: Todo = { id: '1', title: 'First', note: '', projectId: 'project-1', completed: false, createdAt: 1 }
const second: Todo = { id: '2', title: 'Second', note: 'Details', projectId: 'project-1', completed: true, createdAt: 2 }
const todos = [first, second]

test('adds a todo without changing existing state', () => {
  expect(todoReducer([first], { type: 'add', todo: second })).toEqual(todos)
  expect(first.completed).toBe(false)
})

test('toggles the target in both directions without mutating the input', () => {
  const result = todoReducer(todos, { type: 'toggle', id: '1' })
  expect(result).toEqual([{ ...first, completed: true }, second])
  expect(todoReducer(result, { type: 'toggle', id: '1' })).toEqual(todos)
  expect(first.completed).toBe(false)
  expect(result[1]).toBe(second)
})

test('removes only the target', () => {
  expect(todoReducer(todos, { type: 'remove', id: '1' })).toEqual([second])
  expect(todos).toEqual([first, second])
})

test('edits only the title of the target', () => {
  expect(todoReducer(todos, { type: 'edit', id: '2', title: 'Updated' }))
    .toEqual([first, { ...second, title: 'Updated' }])
  expect(second.title).toBe('Second')
})

test('sets a trimmed note and allows removing it', () => {
  const withNote = todoReducer(todos, { type: 'setNote', id: '1', note: '  Line one\nLine two  ' })
  expect(withNote).toEqual([{ ...first, note: 'Line one\nLine two' }, second])
  expect(todoReducer(withNote, { type: 'setNote', id: '1', note: '   ' })).toEqual(todos)
  expect(first.note).toBe('')
})

test('clears completed todos and preserves active todos', () => {
  expect(todoReducer(todos, { type: 'clearCompleted' })).toEqual([first])
  expect(todoReducer([second], { type: 'clearCompleted' })).toEqual([])
  expect(todoReducer([], { type: 'clearCompleted' })).toEqual([])
})

test('ignores unknown ids', () => {
  expect(todoReducer(todos, { type: 'toggle', id: 'missing' })).toEqual(todos)
  expect(todoReducer(todos, { type: 'remove', id: 'missing' })).toEqual(todos)
  expect(todoReducer(todos, { type: 'edit', id: 'missing', title: 'Other' })).toEqual(todos)
  expect(todoReducer(todos, { type: 'setNote', id: 'missing', note: 'Other' })).toEqual(todos)
})
