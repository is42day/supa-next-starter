import { render, screen } from '@/test/test-utils'
import { describe, it, expect } from 'vitest'
import { WorksList } from './works-list'
import type { Work } from '@/lib/db/types'

const mockWorks: Work[] = [
  {
    id: '1',
    author_id: 'user-1',
    title: 'My First Story',
    slug: 'my-first-story',
    description: 'An amazing story',
    visibility: 'private',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-07T00:00:00Z',
  },
  {
    id: '2',
    author_id: 'user-1',
    title: 'Another Work',
    slug: 'another-work',
    description: null,
    visibility: 'public',
    created_at: '2026-01-05T00:00:00Z',
    updated_at: '2026-01-06T00:00:00Z',
  },
]

describe('<WorksList />', () => {
  it('renders all works', () => {
    render(<WorksList works={mockWorks} />)
    
    expect(screen.getByText('My First Story')).toBeInTheDocument()
    expect(screen.getByText('Another Work')).toBeInTheDocument()
  })

  it('displays work descriptions', () => {
    render(<WorksList works={mockWorks} />)
    
    expect(screen.getByText('An amazing story')).toBeInTheDocument()
    expect(screen.getByText('No description')).toBeInTheDocument()
  })

  it('shows visibility badges', () => {
    render(<WorksList works={mockWorks} />)
    
    expect(screen.getByText('Private')).toBeInTheDocument()
    expect(screen.getByText('Public')).toBeInTheDocument()
  })

  it('displays work slugs', () => {
    render(<WorksList works={mockWorks} />)
    
    expect(screen.getByText('/my-first-story')).toBeInTheDocument()
    expect(screen.getByText('/another-work')).toBeInTheDocument()
  })

  it('renders work cards as links', () => {
    render(<WorksList works={mockWorks} />)
    
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(mockWorks.length)
    expect(links[0]).toHaveAttribute('href', '/app/work/1')
  })

  it('handles empty works array', () => {
    const { container } = render(<WorksList works={[]} />)
    
    const grid = container.querySelector('.grid')
    expect(grid?.children).toHaveLength(0)
  })
})
