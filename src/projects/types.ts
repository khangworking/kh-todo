export interface Project {
  id: string
  name: string
  description: string
  dueDate: string | null
  createdAt: number
}

export interface ProjectState {
  projects: Project[]
  activeProjectId: string
}

export type ProjectAction =
  | { type: 'createProject'; project: Project }
  | { type: 'updateProject'; id: string; changes: Pick<Project, 'name' | 'description' | 'dueDate'> }
  | { type: 'deleteProject'; id: string }
  | { type: 'selectProject'; id: string }
