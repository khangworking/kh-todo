import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { ThemeToggle } from './ThemeToggle'

test('renders the three options and marks the active one pressed', () => {
  render(<ThemeToggle theme="system" onChange={() => {}} />)
  expect(screen.getByRole('button', { name: 'System' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: 'Light' })).toHaveAttribute('aria-pressed', 'false')
  expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'false')
})

test('calls onChange with the selected theme', () => {
  const onChange = vi.fn()
  render(<ThemeToggle theme="light" onChange={onChange} />)
  fireEvent.click(screen.getByRole('button', { name: 'Dark' }))
  expect(onChange).toHaveBeenCalledExactlyOnceWith('dark')
})
