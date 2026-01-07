import { render, screen } from '@/test/test-utils'
import { describe, it, expect } from 'vitest'
import { ChaptersList } from './chapters-list'
import type { Chapter } from '@/lib/db/types'

const mockChapters: Chapter[] = [
  {
    id: '1',
    work_id: 'work-1',
    author_id: 'user-1',
    title: 'Chapter 1: The Beginning',
    content_json: null,
    chapter_index: 0,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-07T00:00:00Z',
  },
  {
    id: '2',
    work_id: 'work-1',
    author_id: 'user-1',
    title: 'Chapter 2: The Journey',
    content_json: { blocks: [] },
    chapter_index: 1,
    created_at: '2026-01-02T00:00:00Z',
    updated_at: '2026-01-06T00:00:00Z',
  },
]

describe('<ChaptersList />', () => {
  it('renders all chapters', () => {
    render(<ChaptersList chapters={mockChapters} workId="work-1" />)
    
    // Text is split with "1. Chapter 1" format
    expect(screen.getByText(/Chapter 1: The Beginning/)).toBeInTheDocument()
    expect(screen.getByText(/Chapter 2: The Journey/)).toBeInTheDocument()
  })

  it('displays chapter numbers', () => {
    render(<ChaptersList chapters={mockChapters} workId="work-1" />)
    
    // Numbers are part of the title like "1. Chapter Title"
    expect(screen.getByText(/1\./)).toBeInTheDocument()
    expect(screen.getByText(/2\./)).toBeInTheDocument()
  })

  it('shows edit links for each chapter', () => {
    render(<ChaptersList chapters={mockChapters} workId="work-1" />)
    
    const editLinks = screen.getAllByRole('link')
    expect(editLinks.length).toBeGreaterThan(0)
    expect(editLinks[0]).toHaveAttribute('href', '/app/chapter/1/edit')
  })

  it('shows reorder buttons for chapters', () => {
    render(<ChaptersList chapters={mockChapters} workId="work-1" />)
    
    // Should have up/down arrows
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('disables up arrow for first chapter', () => {
    render(<ChaptersList chapters={mockChapters} workId="work-1" />)
    
    const buttons = screen.getAllByRole('button')
    // First button should be the up arrow for first chapter
    expect(buttons[0]).toBeDisabled()
  })

  it('handles empty chapters array', () => {
    const { container } = render(
      <ChaptersList chapters={[]} workId="work-1" />
    )
    
    expect(container.textContent).toBe('')
  })
})
