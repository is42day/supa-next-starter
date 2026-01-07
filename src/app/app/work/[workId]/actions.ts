'use server'

import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  createChapter,
  updateChapter,
  deleteChapter,
  getWorkChapters,
  createWorkShare,
  generateToken,
} from '@/lib/db/queries'
import { z } from 'zod'

const createChapterSchema = z.object({
  workId: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(200),
})

const updateChapterSchema = z.object({
  chapterId: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  content_json: z.unknown().optional(),
  chapter_index: z.number().int().min(0).optional(),
})

export async function createChapterAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const rawData = {
    workId: formData.get('workId'),
    title: formData.get('title'),
  }

  const result = createChapterSchema.safeParse(rawData)
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  const { workId, title } = result.data

  // Get existing chapters to determine the next index
  const existingChapters = await getWorkChapters(workId)
  const nextIndex = existingChapters.length

  const chapter = await createChapter(workId, user.id, title, nextIndex)

  if (!chapter) {
    return { error: 'Failed to create chapter' }
  }

  revalidatePath(`/app/work/${workId}`)
  redirect(`/app/chapter/${chapter.id}/edit`)
}

export async function updateChapterAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const rawData = {
    chapterId: formData.get('chapterId'),
    title: formData.get('title') || undefined,
    content_json: formData.get('content_json')
      ? JSON.parse(formData.get('content_json') as string)
      : undefined,
    chapter_index: formData.get('chapter_index')
      ? parseInt(formData.get('chapter_index') as string)
      : undefined,
  }

  const result = updateChapterSchema.safeParse(rawData)
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  const { chapterId, ...updates } = result.data

  const chapter = await updateChapter(chapterId, updates)

  if (!chapter) {
    return { error: 'Failed to update chapter' }
  }

  revalidatePath(`/app/chapter/${chapterId}/edit`)
  revalidatePath(`/app/work/${chapter.work_id}`)

  return { success: true }
}

export async function deleteChapterAction(chapterId: string, workId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const success = await deleteChapter(chapterId)

  if (!success) {
    return { error: 'Failed to delete chapter' }
  }

  revalidatePath(`/app/work/${workId}`)
  return { success: true }
}

export async function reorderChapterAction(
  chapterId: string,
  workId: string,
  direction: 'up' | 'down',
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const chapters = await getWorkChapters(workId)
  const currentIndex = chapters.findIndex((ch) => ch.id === chapterId)

  if (currentIndex === -1) {
    return { error: 'Chapter not found' }
  }

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

  if (targetIndex < 0 || targetIndex >= chapters.length) {
    return { error: 'Cannot move chapter in that direction' }
  }

  // Swap indices
  await updateChapter(chapters[currentIndex].id, {
    chapter_index: targetIndex,
  })
  await updateChapter(chapters[targetIndex].id, { chapter_index: currentIndex })

  revalidatePath(`/app/work/${workId}`)
  return { success: true }
}

export async function createShareLinkAction(workId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const token = generateToken(32)
  const share = await createWorkShare(workId, token)

  if (!share) {
    return { error: 'Failed to create share link' }
  }

  revalidatePath(`/app/work/${workId}`)

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/share/${token}`

  return { success: true, shareUrl, token }
}
