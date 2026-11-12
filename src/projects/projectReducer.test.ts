import { expect, test } from 'vitest'
import { projectReducer } from './projectReducer'
import type { Project, ProjectState } from './types'

const first: Project = { id: 'p1', name: 'First', description: '', dueDate: null, createdAt: 1 }
const second: Project = { id: 'p2', name: 'Second', description: 'Details', dueDate: '2026-12-31', createdAt: 2 }
const state: ProjectState = { projects: [first], activeProjectId: first.id }

test('creates a project with a trimmed non-empty name', () => {
  expect(projectReducer(state, { type: 'createProject', project: { ...second, name: '  Second  ' } }))
    .toEqual({ ...state, projects: [first, second] })
  expect(projectReducer(state, { type: 'createProject', project: { ...second, name: '   ' } })).toBe(state)
})

test('updates project fields and rejects invalid values', () => {
  const withTwo = { projects: [first, second], activeProjectId: first.id }
  expect(projectReducer(withTwo, {
    type: 'updateProject',
    id: second.id,
    changes: { name: '  Updated  ', description: 'New details', dueDate: null },
  })).toEqual({
    ...withTwo,
    projects: [first, { ...second, name: 'Updated', description: 'New details', dueDate: null }],
  })
  expect(projectReducer(withTwo, {
    type: 'updateProject',
    id: second.id,
    changes: { name: '', description: '', dueDate: null },
  })).toBe(withTwo)
})

test('selects only an existing project', () => {
  const withTwo = { projects: [first, second], activeProjectId: first.id }
  expect(projectReducer(withTwo, { type: 'selectProject', id: second.id }).activeProjectId).toBe(second.id)
  expect(projectReducer(withTwo, { type: 'selectProject', id: 'missing' })).toBe(withTwo)
})

test('deletes a project, selects a fallback, and preserves the final project', () => {
  const withTwo = { projects: [first, second], activeProjectId: second.id }
  expect(projectReducer(withTwo, { type: 'deleteProject', id: second.id }))
    .toEqual({ projects: [first], activeProjectId: first.id })
  expect(projectReducer(state, { type: 'deleteProject', id: first.id })).toBe(state)
})
