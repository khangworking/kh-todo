import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import App from './App'

test('renders the Todo App heading', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: 'Todo App', level: 1 })).toBeInTheDocument()
})
