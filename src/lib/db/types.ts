// Database types generated from schema
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          handle: string
          display_name: string
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          handle: string
          display_name: string
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          handle?: string
          display_name?: string
          bio?: string | null
          updated_at?: string
        }
      }
      works: {
        Row: {
          id: string
          author_id: string
          title: string
          description: string | null
          visibility: 'private' | 'unlisted' | 'public'
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          description?: string | null
          visibility?: 'private' | 'unlisted' | 'public'
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          visibility?: 'private' | 'unlisted' | 'public'
          slug?: string
          updated_at?: string
        }
      }
      chapters: {
        Row: {
          id: string
          work_id: string
          author_id: string
          chapter_index: number
          title: string
          content_json: unknown
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          work_id: string
          author_id: string
          chapter_index: number
          title: string
          content_json?: unknown
          created_at?: string
          updated_at?: string
        }
        Update: {
          chapter_index?: number
          title?: string
          content_json?: unknown
          updated_at?: string
        }
      }
      chapter_revisions: {
        Row: {
          id: string
          chapter_id: string
          author_id: string
          content_json: unknown
          summary: string | null
          created_at: string
        }
        Insert: {
          id?: string
          chapter_id: string
          author_id: string
          content_json: unknown
          summary?: string | null
          created_at?: string
        }
        Update: {
          summary?: string | null
        }
      }
      inline_comments: {
        Row: {
          id: string
          chapter_id: string
          author_id: string
          anchor: {
            from: number
            to: number
            quote: string
            contextBefore?: string
            contextAfter?: string
          }
          body: string
          status: 'open' | 'resolved'
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          chapter_id: string
          author_id: string
          anchor: {
            from: number
            to: number
            quote: string
            contextBefore?: string
            contextAfter?: string
          }
          body: string
          status?: 'open' | 'resolved'
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          body?: string
          status?: 'open' | 'resolved'
          resolved_at?: string | null
        }
      }
      chapter_feedback: {
        Row: {
          id: string
          chapter_id: string
          reader_id: string | null
          answers: {
            whatWorked?: string
            whereLostInterest?: string
            favoriteLine?: string
          }
          created_at: string
        }
        Insert: {
          id?: string
          chapter_id: string
          reader_id?: string | null
          answers: {
            whatWorked?: string
            whereLostInterest?: string
            favoriteLine?: string
          }
          created_at?: string
        }
        Update: never
      }
      work_shares: {
        Row: {
          id: string
          work_id: string
          token: string
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          work_id: string
          token: string
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          expires_at?: string | null
        }
      }
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Work = Database['public']['Tables']['works']['Row']
export type Chapter = Database['public']['Tables']['chapters']['Row']
export type ChapterRevision = Database['public']['Tables']['chapter_revisions']['Row']
export type InlineComment = Database['public']['Tables']['inline_comments']['Row']
export type ChapterFeedback = Database['public']['Tables']['chapter_feedback']['Row']
export type WorkShare = Database['public']['Tables']['work_shares']['Row']

// Extended types with relations
export type WorkWithAuthor = Work & {
  author: Profile
}

export type ChapterWithWork = Chapter & {
  work: Work
}

export type WorkWithChapters = Work & {
  chapters: Chapter[]
  author: Profile
}

export type CommentWithAuthor = InlineComment & {
  author: Profile
}
