import type { ProjectAction, ProjectState } from './types'

export function isDueDate(value: unknown): value is string | null {
  return value === null || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value))
}

export function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case 'createProject': {
      const name = action.project.name.trim()
      if (!name || !isDueDate(action.project.dueDate)) return state
      return { ...state, projects: [...state.projects, { ...action.project, name }] }
    }
    case 'updateProject': {
      const name = action.changes.name.trim()
      if (!name || !isDueDate(action.changes.dueDate)) return state
      return {
        ...state,
        projects: state.projects.map(project => project.id === action.id
          ? { ...project, ...action.changes, name }
          : project),
      }
    }
    case 'deleteProject': {
      if (state.projects.length === 1 || !state.projects.some(project => project.id === action.id)) return state
      const projects = state.projects.filter(project => project.id !== action.id)
      return {
        projects,
        activeProjectId: state.activeProjectId === action.id ? projects[0].id : state.activeProjectId,
      }
    }
    case 'selectProject':
      return state.projects.some(project => project.id === action.id)
        ? { ...state, activeProjectId: action.id }
        : state
  }
}
