import { useEffect, useReducer } from 'react'
import { todoReducer } from '../todos/todoReducer'
import type { Todo, TodoAction } from '../todos/types'
import { loadTodos, TODOS_STORAGE_KEY } from '../todos/useTodos'
import { titleize } from '../todos/titleize'
import { isDueDate, projectReducer } from './projectReducer'
import type { Project, ProjectAction, ProjectState } from './types'

export const PROJECTS_STORAGE_KEY = 'todoapp.projects'
export const ACTIVE_PROJECT_STORAGE_KEY = 'todoapp.activeProjectId'

interface WorkspaceState extends ProjectState {
  todos: Todo[]
}

type WorkspaceAction = ProjectAction | { type: 'todo'; action: TodoAction }

function isProject(value: unknown): value is Project {
  if (typeof value !== 'object' || value === null) return false
  const project = value as Record<string, unknown>
  return typeof project.id === 'string'
    && typeof project.name === 'string'
    && project.name.trim().length > 0
    && typeof project.description === 'string'
    && isDueDate(project.dueDate)
    && typeof project.createdAt === 'number'
    && Number.isFinite(project.createdAt)
}

function createDefaultProject(): Project {
  return {
    id: crypto.randomUUID(),
    name: 'My Todos',
    description: '',
    dueDate: null,
    createdAt: Date.now(),
  }
}

function loadProjects(): Project[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) ?? '[]')
    if (!Array.isArray(value) || !value.every(isProject)) return []
    const ids = new Set(value.map(project => project.id))
    if (ids.size !== value.length) return []
    return value.map(project => ({ ...project, name: project.name.trim() }))
  } catch {
    return []
  }
}

function loadWorkspace(): WorkspaceState {
  const savedProjects = loadProjects()
  const projects = savedProjects.length > 0 ? savedProjects : [createDefaultProject()]
  let savedActiveProjectId: string | null = null
  try {
    savedActiveProjectId = localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY)
  } catch {
    // Use the first project when storage is unavailable.
  }
  const activeProjectId = projects.some(project => project.id === savedActiveProjectId)
    ? savedActiveProjectId!
    : projects[0].id
  const projectIds = new Set(projects.map(project => project.id))
  return { projects, activeProjectId, todos: loadTodos(projectIds, projects[0].id) }
}

export function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  if (action.type === 'todo') return { ...state, todos: todoReducer(state.todos, action.action) }

  const projectState = projectReducer(state, action)
  if (action.type !== 'deleteProject' || projectState === state) return { ...state, ...projectState }
  return {
    ...projectState,
    todos: state.todos.filter(todo => todo.projectId !== action.id),
  }
}

export function useProjects() {
  const [state, dispatch] = useReducer(workspaceReducer, undefined, loadWorkspace)
  const activeProject = state.projects.find(project => project.id === state.activeProjectId)!
  const todos = state.todos.filter(todo => todo.projectId === state.activeProjectId)

  useEffect(() => {
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(state.projects))
      localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, state.activeProjectId)
      localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(state.todos))
    } catch {
      // Keep the in-memory workspace usable when storage is unavailable or full.
    }
  }, [state])

  function createProject(name: string, description = '', dueDate: string | null = null) {
    if (!name.trim() || !isDueDate(dueDate)) return null
    const project: Project = {
      id: crypto.randomUUID(),
      name,
      description,
      dueDate,
      createdAt: Date.now(),
    }
    dispatch({ type: 'createProject', project })
    return project.id
  }

  function updateProject(id: string, changes: Partial<Pick<Project, 'name' | 'description' | 'dueDate'>>) {
    const project = state.projects.find(candidate => candidate.id === id)
    if (!project) return
    dispatch({
      type: 'updateProject',
      id,
      changes: {
        name: changes.name ?? project.name,
        description: changes.description ?? project.description,
        dueDate: changes.dueDate === undefined ? project.dueDate : changes.dueDate,
      },
    })
  }

  return {
    projects: state.projects,
    activeProjectId: state.activeProjectId,
    activeProject,
    todos,
    allTodos: state.todos,
    createProject,
    updateProject,
    deleteProject: (id: string) => dispatch({ type: 'deleteProject', id }),
    selectProject: (id: string) => dispatch({ type: 'selectProject', id }),
    addTodo: (title: string) => dispatch({
      type: 'todo',
      action: {
        type: 'add',
        todo: {
          id: crypto.randomUUID(),
          title: titleize(title),
          note: '',
          projectId: state.activeProjectId,
          completed: false,
          createdAt: Date.now(),
        },
      },
    }),
    toggleTodo: (id: string) => dispatch({ type: 'todo', action: { type: 'toggle', id } }),
    removeTodo: (id: string) => dispatch({ type: 'todo', action: { type: 'remove', id } }),
    editTodo: (id: string, title: string) => dispatch({ type: 'todo', action: { type: 'edit', id, title: titleize(title) } }),
    setNote: (id: string, note: string) => dispatch({ type: 'todo', action: { type: 'setNote', id, note } }),
    clearCompleted: () => dispatch({
      type: 'todo',
      action: { type: 'clearCompleted', projectId: state.activeProjectId },
    }),
  }
}
