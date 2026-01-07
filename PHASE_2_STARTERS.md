# Phase 2 Starter Code & Snippets

This file contains starting templates for Phase 2 (Editor & Reading) to help you get started quickly.

## Chapter Editor Page Structure

### File: `src/app/app/chapter/[chapterId]/page.tsx`

```typescript
import { createClient } from '@/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getChapter, getProfile } from '@/lib/db/queries'
import { ChapterEditor } from '@/components/editor/chapter-editor'

type PageProps = {
  params: Promise<{ chapterId: string }>
}

export default async function ChapterEditPage({ params }: PageProps) {
  const { chapterId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const chapter = await getChapter(chapterId)
  if (!chapter) {
    notFound()
  }

  // Verify user is author
  if (chapter.author_id !== user.id) {
    redirect('/app')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <ChapterEditor chapter={chapter} />
    </div>
  )
}
```

### File: `src/components/editor/chapter-editor.tsx`

```typescript
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { type Chapter } from '@/lib/db/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ChevronLeft, Save, Clock } from 'lucide-react'
import Link from 'next/link'
import debounce from 'lodash/debounce'

// Will replace with actual Plate editor
const PlateEditor = ({ content }: { content: unknown }) => {
  return <div className="p-8 text-gray-500">Editor component (Phase 2)</div>
}

type ChapterEditorProps = {
  chapter: Chapter
}

export function ChapterEditor({ chapter }: ChapterEditorProps) {
  const [content, setContent] = useState(chapter.content_json)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showSaveRevision, setShowSaveRevision] = useState(false)
  const [revisionSummary, setRevisionSummary] = useState('')

  // Debounced autosave
  const debouncedSave = useRef(
    debounce(async (contentToSave: unknown) => {
      setIsSaving(true)
      try {
        const formData = new FormData()
        formData.append('chapterId', chapter.id)
        formData.append('content_json', JSON.stringify(contentToSave))

        // Will implement: updateChapterAction(formData)
        setLastSaved(new Date())
      } catch (error) {
        console.error('Autosave failed:', error)
      } finally {
        setIsSaving(false)
      }
    }, 1500)
  ).current

  const handleContentChange = useCallback((newContent: unknown) => {
    setContent(newContent)
    debouncedSave(newContent)
  }, [debouncedSave])

  async function handleSaveRevision() {
    // Will implement: createRevisionAction(chapterId, content, summary)
    setShowSaveRevision(false)
    setRevisionSummary('')
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4 dark:bg-slate-950">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/app/work/${chapter.work_id}`}>
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">{chapter.title}</h1>
              {lastSaved && (
                <p className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  Saved {lastSaved.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>

          <Button
            onClick={() => setShowSaveRevision(true)}
            variant="outline"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Revision
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <PlateEditor content={content} />
      </div>

      {/* Save Revision Dialog */}
      <Dialog open={showSaveRevision} onOpenChange={setShowSaveRevision}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save a Revision</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Summary (optional)</label>
              <Input
                placeholder="What changed? E.g., 'Fixed pacing in middle section'"
                value={revisionSummary}
                onChange={(e) => setRevisionSummary(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowSaveRevision(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveRevision}>Save Revision</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

## Reading Mode Pages

### File: `src/app/w/[slug]/page.tsx`

```typescript
import { createClient } from '@/supabase/server'
import { notFound } from 'next/navigation'
import { getWorkBySlug, getWorkChapters } from '@/lib/db/queries'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function WorkPage({ params }: PageProps) {
  const { slug } = await params

  const work = await getWorkBySlug(slug)
  if (!work || work.visibility !== 'public') {
    notFound()
  }

  const chapters = await getWorkChapters(work.id)

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Work Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">{work.title}</h1>
        {work.description && (
          <p className="text-muted-foreground mt-4 text-lg">
            {work.description}
          </p>
        )}
      </div>

      {/* Chapters List */}
      <div className="space-y-3">
        {chapters.length === 0 ? (
          <div className="text-muted-foreground text-center py-12">
            <BookOpen className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>No chapters published yet.</p>
          </div>
        ) : (
          chapters.map((chapter) => (
            <Link
              key={chapter.id}
              href={`/w/${slug}/c/${chapter.chapter_index}`}
            >
              <Button
                variant="ghost"
                className="w-full justify-start text-left text-lg"
              >
                {chapter.chapter_index + 1}. {chapter.title}
              </Button>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
```

### File: `src/app/w/[slug]/c/[chapterIndex]/page.tsx`

```typescript
import { createClient } from '@/supabase/server'
import { notFound, redirect } from 'next/navigation'
import {
  getWorkBySlug,
  getChapterByIndex,
  getWorkChapters,
} from '@/lib/db/queries'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type PageProps = {
  params: Promise<{ slug: string; chapterIndex: string }>
}

export default async function ChapterPage({ params }: PageProps) {
  const { slug, chapterIndex } = await params

  const work = await getWorkBySlug(slug)
  if (!work || work.visibility !== 'public') {
    notFound()
  }

  const index = parseInt(chapterIndex, 10)
  const chapter = await getChapterByIndex(work.id, index)
  if (!chapter) {
    notFound()
  }

  const chapters = await getWorkChapters(work.id)
  const prevChapter = index > 0 ? chapters[index - 1] : null
  const nextChapter = index < chapters.length - 1 ? chapters[index + 1] : null

  return (
    <article className="mx-auto max-w-2xl px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <Link href={`/w/${slug}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{chapter.title}</h1>
        <p className="text-muted-foreground mt-2">
          Chapter {index + 1} of {chapters.length}
        </p>
      </div>

      {/* Content */}
      <div className="prose dark:prose-invert max-w-none">
        {/* Render chapter.content_json here */}
        <p>Chapter content goes here</p>
      </div>

      {/* Navigation */}
      <div className="mt-12 flex justify-between border-t pt-8">
        {prevChapter ? (
          <Link href={`/w/${slug}/c/${prevChapter.chapter_index}`}>
            <Button variant="outline">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
          </Link>
        ) : (
          <div />
        )}

        {nextChapter ? (
          <Link href={`/w/${slug}/c/${nextChapter.chapter_index}`}>
            <Button>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Button asChild>
            <Link href={`/w/${slug}/c/${index}/respond`}>
              Leave Feedback
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </article>
  )
}
```

## Share Link Route

### File: `src/app/share/[token]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getWorkShareByToken } from '@/lib/db/queries'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const share = await getWorkShareByToken(token)
  if (!share) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
  }

  // Get work to find slug
  // Then redirect to /w/[slug] with cookie

  const response = NextResponse.redirect(`/w/[slug]`, 302)

  // Set httpOnly cookie with work access
  response.cookies.set(
    'work_access',
    JSON.stringify({ workId: share.work_id }),
    {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
    }
  )

  return response
}
```

## Server Actions for Editor

### File: `src/app/app/chapter/[chapterId]/editor-actions.ts`

```typescript
'use server'

import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { updateChapter, createRevision } from '@/lib/db/queries'
import { z } from 'zod'

const updateContentSchema = z.object({
  chapterId: z.string().uuid(),
  content_json: z.unknown(),
})

const saveRevisionSchema = z.object({
  chapterId: z.string().uuid(),
  content_json: z.unknown(),
  summary: z.string().optional(),
})

export async function autoSaveAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const data = {
    chapterId: formData.get('chapterId'),
    content_json: JSON.parse(formData.get('content_json') as string),
  }

  const result = updateContentSchema.safeParse(data)
  if (!result.success) {
    return { error: 'Invalid data' }
  }

  const { chapterId, content_json } = result.data

  await updateChapter(chapterId, { content_json })

  // Don't revalidate on every keystroke (expensive)
  // revalidatePath(`/app/chapter/${chapterId}/edit`)

  return { success: true, savedAt: new Date().toISOString() }
}

export async function saveRevisionAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const data = {
    chapterId: formData.get('chapterId'),
    content_json: JSON.parse(formData.get('content_json') as string),
    summary: formData.get('summary') || undefined,
  }

  const result = saveRevisionSchema.safeParse(data)
  if (!result.success) {
    return { error: 'Invalid data' }
  }

  const { chapterId, content_json, summary } = result.data

  const revision = await createRevision(
    chapterId,
    user.id,
    content_json,
    summary
  )

  if (!revision) {
    return { error: 'Failed to save revision' }
  }

  revalidatePath(`/app/chapter/${chapterId}/edit`)

  return { success: true, revisionId: revision.id }
}
```

## Plate Editor Integration (When Ready)

```typescript
// After: pnpm add @udecode/plate-common @udecode/plate-basic-marks

import { createPlateEditor } from '@udecode/plate-common'

const plugins = [
  // Basic plugins
  createParagraphPlugin(),
  createHeadingPlugin(),
  createBoldPlugin(),
  createItalicPlugin(),
  createUnderlinePlugin(),
  // ... more plugins
]

const editor = createPlateEditor({ plugins, value: initialContent })
```

---

These templates should give you a head start on Phase 2. The key points:

1. **Server components fetch data** (work, chapters)
2. **Client components handle interaction** (editor, navigation)
3. **Server actions handle mutations** (autosave, save revision)
4. **Debounce autosave** to avoid excessive database writes
5. **RLS prevents unauthorized access** at database level

**Next: Pick one (editor or reading) and implement it fully before moving to the other.**
