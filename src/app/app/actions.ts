'use server'

import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  createWork,
  updateWork,
  deleteWork,
  generateSlug,
  getUserWorks,
  getProfile,
  createProfile,
} from '@/lib/db/queries'
import { z } from 'zod'

const createWorkSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  visibility: z.enum(['private', 'unlisted', 'public']).default('private'),
})

const updateWorkSchema = z.object({
  workId: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().nullable().optional(),
  visibility: z.enum(['private', 'unlisted', 'public']).optional(),
  slug: z.string().min(3).max(100).optional(),
})

export async function createWorkAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Ensure user has a profile
  let profile = await getProfile(user.id)
  if (!profile) {
    // Create a default profile if it doesn't exist
    const handle = user.email?.split('@')[0] || 'user'
    profile = await createProfile(user.id, handle, user.email || 'User')
    if (!profile) {
      return { error: 'Failed to create profile' }
    }
  }

  const rawData = {
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    visibility: formData.get('visibility') || 'private',
  }

  const result = createWorkSchema.safeParse(rawData)
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  const { title, description, visibility } = result.data

  // Generate slug from title
  const baseSlug = generateSlug(title)
  let slug = baseSlug
  let counter = 1

  // Ensure slug is unique by checking existing works
  const existingWorks = await getUserWorks(user.id)
  const existingSlugs = new Set(existingWorks.map((w) => w.slug))

  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  const work = await createWork(user.id, title, slug, description, visibility)

  if (!work) {
    return { error: 'Failed to create work' }
  }

  revalidatePath('/app')
  redirect(`/app/work/${work.id}`)
}

export async function updateWorkAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const rawData = {
    workId: formData.get('workId'),
    title: formData.get('title') || undefined,
    description: formData.get('description') || undefined,
    visibility: formData.get('visibility') || undefined,
    slug: formData.get('slug') || undefined,
  }

  const result = updateWorkSchema.safeParse(rawData)
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  const { workId, ...updates } = result.data

  const work = await updateWork(workId, updates)

  if (!work) {
    return { error: 'Failed to update work' }
  }

  revalidatePath(`/app/work/${workId}`)
  revalidatePath('/app')

  return { success: true }
}

export async function deleteWorkAction(workId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const success = await deleteWork(workId)

  if (!success) {
    return { error: 'Failed to delete work' }
  }

  revalidatePath('/app')
  return { success: true }
}
