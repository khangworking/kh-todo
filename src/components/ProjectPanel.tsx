import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Project } from '../projects/types'
import { formatProjectDueDate, isProjectOverdue } from './projectDates'

interface ProjectPanelProps {
  projects: Project[]
  activeProject: Project
  todoCount: number
  incompleteCount: number
  onSelect: (id: string) => void
  onCreate: (name: string, description: string, dueDate: string | null) => string | null
  onUpdate: (id: string, changes: Pick<Project, 'name' | 'description' | 'dueDate'>) => void
  onDelete: (id: string) => void
  onProjectChange: () => void
}

interface ProjectFormProps {
  project?: Project
  onSave: (name: string, description: string, dueDate: string | null) => void
  onCancel: () => void
}

function ProjectForm({ project, onSave, onCancel }: ProjectFormProps) {
  const [name, setName] = useState(project?.name ?? '')
  const [description, setDescription] = useState(project?.description ?? '')
  const [dueDate, setDueDate] = useState(project?.dueDate ?? '')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) {
      setError('Project name is required.')
      return
    }
    onSave(name, description, dueDate || null)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-lg border border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="grid gap-4">
        <div>
          <label htmlFor="project-name" className="mb-1 block font-semibold">Project name</label>
          <input id="project-name" autoFocus value={name} onChange={event => { setName(event.target.value); setError('') }} aria-invalid={Boolean(error)} aria-describedby={error ? 'project-name-error' : undefined} className="w-full rounded-md border border-slate-400 bg-white p-2 text-slate-900 focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-3 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus-visible:outline-blue-400" />
          {error && <p id="project-name-error" role="alert" className="mt-1 text-sm text-red-700 dark:text-red-400">{error}</p>}
        </div>
        <div>
          <label htmlFor="project-description" className="mb-1 block font-semibold">Description</label>
          <textarea id="project-description" rows={3} value={description} onChange={event => setDescription(event.target.value)} className="w-full resize-y rounded-md border border-slate-400 bg-white p-2 text-slate-900 focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-3 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus-visible:outline-blue-400" />
        </div>
        <div>
          <label htmlFor="project-due-date" className="mb-1 block font-semibold">Due date</label>
          <input id="project-due-date" type="date" value={dueDate} onChange={event => setDueDate(event.target.value)} className="rounded-md border border-slate-400 bg-white p-2 text-slate-900 focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-3 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus-visible:outline-blue-400" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button type="submit" className="cursor-pointer rounded-md bg-blue-700 px-4 py-2 text-white hover:bg-blue-800 focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-3 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus-visible:outline-blue-400">Save</button>
        <button type="button" onClick={onCancel} className="cursor-pointer rounded-md border border-slate-400 bg-white px-4 py-2 text-slate-900 focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-3 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus-visible:outline-blue-400">Cancel</button>
      </div>
    </form>
  )
}

export function ProjectPanel({ projects, activeProject, todoCount, incompleteCount, onSelect, onCreate, onUpdate, onDelete, onProjectChange }: ProjectPanelProps) {
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null)
  const overdue = isProjectOverdue(activeProject.dueDate, incompleteCount > 0)

  function selectProject(id: string) {
    setFormMode(null)
    onSelect(id)
    onProjectChange()
  }

  function deleteProject() {
    const noun = todoCount === 1 ? 'todo' : 'todos'
    if (!window.confirm(`Delete “${activeProject.name}” and its ${todoCount} ${noun}?`)) return
    setFormMode(null)
    onDelete(activeProject.id)
    onProjectChange()
  }

  return (
    <section className="mb-8 rounded-xl border border-slate-300 p-4 dark:border-slate-700" aria-labelledby="active-project-name">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-48 flex-1">
          <label htmlFor="project-select" className="mb-1 block font-semibold">Project</label>
          <select id="project-select" value={activeProject.id} onChange={event => selectProject(event.target.value)} className="w-full rounded-md border border-slate-400 bg-white p-2 text-slate-900 focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-3 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus-visible:outline-blue-400">
            {projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
        </div>
        <button type="button" onClick={() => setFormMode('create')} className="cursor-pointer rounded-md bg-blue-700 px-4 py-2 text-white hover:bg-blue-800 focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-3 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus-visible:outline-blue-400">New project</button>
      </div>

      <div className="mt-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="active-project-name" className="text-xl font-semibold">{activeProject.name}</h2>
          {overdue && <span className="rounded-full bg-red-100 px-2 py-1 text-sm font-semibold text-red-800 dark:bg-red-950 dark:text-red-300">Overdue</span>}
        </div>
        {activeProject.description && <p className="mt-2 whitespace-pre-wrap wrap-anywhere text-slate-700 dark:text-slate-300">{activeProject.description}</p>}
        {activeProject.dueDate && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Due {formatProjectDueDate(activeProject.dueDate)}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => setFormMode('edit')} className="cursor-pointer rounded-md border border-slate-400 bg-white px-3 py-2 text-slate-900 focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-3 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus-visible:outline-blue-400">Edit project</button>
          <button type="button" disabled={projects.length === 1} onClick={deleteProject} className="cursor-pointer rounded-md border border-red-300 bg-white px-3 py-2 text-red-700 disabled:cursor-default disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-3 dark:border-red-900 dark:bg-slate-800 dark:text-red-400 dark:focus-visible:outline-blue-400">Delete project</button>
        </div>
      </div>

      {formMode === 'create' && <ProjectForm onCancel={() => setFormMode(null)} onSave={(name, description, dueDate) => {
        const id = onCreate(name, description, dueDate)
        if (!id) return
        onSelect(id)
        onProjectChange()
        setFormMode(null)
      }} />}
      {formMode === 'edit' && <ProjectForm project={activeProject} onCancel={() => setFormMode(null)} onSave={(name, description, dueDate) => {
        onUpdate(activeProject.id, { name, description, dueDate })
        setFormMode(null)
      }} />}
    </section>
  )
}
