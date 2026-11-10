import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { TodoInput } from './TodoInput'

test('handles form submission used by Enter and trims the title', () => {
  const onAdd = vi.fn()
  render(<TodoInput onAdd={onAdd} />)
  const input = screen.getByRole('textbox', { name: 'New todo' })
  fireEvent.change(input, { target: { value: '  A task  ' } })
  fireEvent.submit(input.closest('form')!)
  expect(onAdd).toHaveBeenCalledExactlyOnceWith('A task')
  expect(input).toHaveValue('')
})
