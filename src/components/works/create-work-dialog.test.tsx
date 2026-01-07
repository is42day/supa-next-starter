import { render, screen, waitFor } from '@/test/test-utils'
import { describe, it, expect, vi } from 'vitest'
import { CreateWorkDialog } from './create-work-dialog'

// Mock the server action
vi.mock('@/app/app/actions', () => ({
  createWorkAction: vi.fn(),
}))

describe('<CreateWorkDialog />', () => {
  it('renders the trigger button', () => {
    render(<CreateWorkDialog />)
    expect(screen.getByText('New Work')).toBeInTheDocument()
  })

  it('opens dialog when button is clicked', async () => {
    render(<CreateWorkDialog />)
    
    const button = screen.getByText('New Work')
    button.click()

    await waitFor(() => {
      expect(screen.getByText('Create New Work')).toBeInTheDocument()
    })
  })

  it('renders all form fields', async () => {
    render(<CreateWorkDialog />)
    
    const button = screen.getByText('New Work')
    button.click()

    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/visibility/i)).toBeInTheDocument()
    })
  })

  it('has private as default visibility', async () => {
    render(<CreateWorkDialog />)
    
    const button = screen.getByText('New Work')
    button.click()

    await waitFor(() => {
      const select = screen.getByRole('combobox')
      expect(select).toHaveTextContent('Private')
    })
  })
})
