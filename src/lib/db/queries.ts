import { createClient } from '@/supabase/server'
import type {
  Work,
  Chapter,
  Profile,
  WorkWithAuthor,
  WorkWithChapters,
  ChapterWithWork,
  ChapterRevision,
  InlineComment,
  CommentWithAuthor,
  ChapterFeedback,
  WorkShare,
} from './types'

// ============================================================================
// PROFILES
// ============================================================================

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return null
  return data
}

export async function getProfileByHandle(
  handle: string,
): Promise<Profile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('handle', handle)
    .single()

  if (error) return null
  return data
}

export async function createProfile(
  userId: string,
  handle: string,
  displayName: string,
): Promise<Profile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      handle,
      display_name: displayName,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating profile:', error)
    return null
  }
  return data
}

export async function updateProfile(
  userId: string,
  updates: { handle?: string; display_name?: string; bio?: string },
): Promise<Profile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) return null
  return data
}

// ============================================================================
// WORKS
// ============================================================================

export async function getWork(workId: string): Promise<Work | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('works')
    .select('*')
    .eq('id', workId)
    .single()

  if (error) return null
  return data
}

export async function getWorkBySlug(slug: string): Promise<Work | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('works')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) return null
  return data
}

export async function getWorkWithAuthor(
  workId: string,
): Promise<WorkWithAuthor | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('works')
    .select('*, author:profiles!works_author_id_fkey(*)')
    .eq('id', workId)
    .single()

  if (error) return null
  return data as WorkWithAuthor
}

export async function getWorkWithChapters(
  workId: string,
): Promise<WorkWithChapters | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('works')
    .select(
      '*, author:profiles!works_author_id_fkey(*), chapters(*, order:chapter_index)',
    )
    .eq('id', workId)
    .single()

  if (error) return null

  // Sort chapters by index
  if (data.chapters) {
    data.chapters.sort(
      (a: Chapter, b: Chapter) => (a.chapter_index ?? 0) - (b.chapter_index ?? 0),
    )
  }

  return data as unknown as WorkWithChapters
}

export async function getUserWorks(userId: string): Promise<Work[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('works')
    .select('*')
    .eq('author_id', userId)
    .order('updated_at', { ascending: false })

  if (error) return []
  return data
}

export async function createWork(
  authorId: string,
  title: string,
  slug: string,
  description?: string,
  visibility: 'private' | 'unlisted' | 'public' = 'private',
): Promise<Work | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('works')
    .insert({
      author_id: authorId,
      title,
      slug,
      description,
      visibility,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating work:', error)
    return null
  }
  return data
}

export async function updateWork(
  workId: string,
  updates: {
    title?: string
    description?: string | null
    visibility?: 'private' | 'unlisted' | 'public'
    slug?: string
  },
): Promise<Work | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('works')
    .update(updates)
    .eq('id', workId)
    .select()
    .single()

  if (error) return null
  return data
}

export async function deleteWork(workId: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase.from('works').delete().eq('id', workId)

  return !error
}

// ============================================================================
// CHAPTERS
// ============================================================================

export async function getChapter(chapterId: string): Promise<Chapter | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('id', chapterId)
    .single()

  if (error) return null
  return data
}

export async function getChapterWithWork(
  chapterId: string,
): Promise<ChapterWithWork | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chapters')
    .select('*, work:works(*)')
    .eq('id', chapterId)
    .single()

  if (error) return null
  return data as unknown as ChapterWithWork
}

export async function getChapterByIndex(
  workId: string,
  chapterIndex: number,
): Promise<Chapter | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('work_id', workId)
    .eq('chapter_index', chapterIndex)
    .single()

  if (error) return null
  return data
}

export async function getWorkChapters(workId: string): Promise<Chapter[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('work_id', workId)
    .order('chapter_index', { ascending: true })

  if (error) return []
  return data
}

export async function createChapter(
  workId: string,
  authorId: string,
  title: string,
  chapterIndex: number,
  contentJson: unknown = [],
): Promise<Chapter | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chapters')
    .insert({
      work_id: workId,
      author_id: authorId,
      title,
      chapter_index: chapterIndex,
      content_json: contentJson,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating chapter:', error)
    return null
  }
  return data
}

export async function updateChapter(
  chapterId: string,
  updates: {
    title?: string
    content_json?: unknown
    chapter_index?: number
  },
): Promise<Chapter | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chapters')
    .update(updates)
    .eq('id', chapterId)
    .select()
    .single()

  if (error) return null
  return data
}

export async function deleteChapter(chapterId: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase.from('chapters').delete().eq('id', chapterId)

  return !error
}

// ============================================================================
// CHAPTER REVISIONS
// ============================================================================

export async function getChapterRevisions(
  chapterId: string,
): Promise<ChapterRevision[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chapter_revisions')
    .select('*')
    .eq('chapter_id', chapterId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function createRevision(
  chapterId: string,
  authorId: string,
  contentJson: unknown,
  summary?: string,
): Promise<ChapterRevision | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chapter_revisions')
    .insert({
      chapter_id: chapterId,
      author_id: authorId,
      content_json: contentJson,
      summary,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating revision:', error)
    return null
  }
  return data
}

// ============================================================================
// INLINE COMMENTS
// ============================================================================

export async function getChapterComments(
  chapterId: string,
): Promise<CommentWithAuthor[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inline_comments')
    .select('*, author:profiles!inline_comments_author_id_fkey(*)')
    .eq('chapter_id', chapterId)
    .order('created_at', { ascending: true })

  if (error) return []
  return data as unknown as CommentWithAuthor[]
}

export async function createComment(
  chapterId: string,
  authorId: string,
  anchor: {
    from: number
    to: number
    quote: string
    contextBefore?: string
    contextAfter?: string
  },
  body: string,
): Promise<InlineComment | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inline_comments')
    .insert({
      chapter_id: chapterId,
      author_id: authorId,
      anchor,
      body,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating comment:', error)
    return null
  }
  return data
}

export async function updateCommentStatus(
  commentId: string,
  status: 'open' | 'resolved',
): Promise<InlineComment | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inline_comments')
    .update({
      status,
      resolved_at: status === 'resolved' ? new Date().toISOString() : null,
    })
    .eq('id', commentId)
    .select()
    .single()

  if (error) return null
  return data
}

// ============================================================================
// CHAPTER FEEDBACK
// ============================================================================

export async function getChapterFeedback(
  chapterId: string,
): Promise<ChapterFeedback[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chapter_feedback')
    .select('*')
    .eq('chapter_id', chapterId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function createFeedback(
  chapterId: string,
  answers: {
    whatWorked?: string
    whereLostInterest?: string
    favoriteLine?: string
  },
  readerId?: string,
): Promise<ChapterFeedback | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chapter_feedback')
    .insert({
      chapter_id: chapterId,
      reader_id: readerId || null,
      answers,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating feedback:', error)
    return null
  }
  return data
}

// ============================================================================
// WORK SHARES
// ============================================================================

export async function getWorkShares(workId: string): Promise<WorkShare[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('work_shares')
    .select('*')
    .eq('work_id', workId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getWorkShareByToken(
  token: string,
): Promise<WorkShare | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('work_shares')
    .select('*')
    .eq('token', token)
    .single()

  if (error) return null

  // Check if expired
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return null
  }

  return data
}

export async function createWorkShare(
  workId: string,
  token: string,
  expiresAt?: Date,
): Promise<WorkShare | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('work_shares')
    .insert({
      work_id: workId,
      token,
      expires_at: expiresAt?.toISOString() || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating work share:', error)
    return null
  }
  return data
}

export async function deleteWorkShare(shareId: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('work_shares')
    .delete()
    .eq('id', shareId)

  return !error
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
}

export function generateToken(length: number = 32): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
