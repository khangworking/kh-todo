function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  return date.getFullYear() === Number(year)
    && date.getMonth() === Number(month) - 1
    && date.getDate() === Number(day)
    ? date
    : null
}

export function isProjectOverdue(dueDate: string | null, hasIncompleteTodos: boolean, now = new Date()) {
  if (!dueDate || !hasIncompleteTodos) return false
  const due = parseLocalDate(dueDate)
  if (!due) return false
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return due < today
}

export function formatProjectDueDate(dueDate: string) {
  const date = parseLocalDate(dueDate)
  return date ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date) : dueDate
}
