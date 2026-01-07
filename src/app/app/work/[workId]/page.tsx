import { createClient } from '@/supabase/server'
import { redirect, notFound } from 'next/navigation'
import {
  getWorkWithChapters,
  getProfile,
  getWorkShares,
} from '@/lib/db/queries'
import { WorkSettings } from '@/components/works/work-settings'
import { ChaptersList } from '@/components/works/chapters-list'
import { CreateChapterDialog } from '@/components/works/create-chapter-dialog'
import { ShareLinkSection } from '@/components/works/share-link-section'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

type PageProps = {
  params: Promise<{ workId: string }>
}

export default async function WorkManagePage({ params }: PageProps) {
  const { workId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const profile = await getProfile(user.id)
  const work = await getWorkWithChapters(workId)

  if (!work) {
    notFound()
  }

  // Check if user is the author
  if (work.author_id !== user.id) {
    redirect('/app')
  }

  const shares = await getWorkShares(workId)

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/app">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{work.title}</h1>
        {work.description && (
          <p className="text-muted-foreground mt-2">{work.description}</p>
        )}
      </div>

      <div className="space-y-8">
        {/* Work Settings */}
        <WorkSettings work={work} />

        {/* Share Link Section */}
        {work.visibility === 'unlisted' && (
          <ShareLinkSection workId={workId} shares={shares} />
        )}

        {/* Chapters */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Chapters</h2>
            <CreateChapterDialog workId={workId} />
          </div>

          {work.chapters.length === 0 ? (
            <div className="border-muted rounded-lg border-2 border-dashed p-8 text-center">
              <p className="text-muted-foreground mb-4 text-sm">
                No chapters yet. Start writing by creating your first chapter.
              </p>
              <CreateChapterDialog workId={workId} variant="default" />
            </div>
          ) : (
            <ChaptersList chapters={work.chapters} workId={workId} />
          )}
        </div>

        {/* Public Link */}
        {work.visibility === 'public' && (
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="mb-2 font-semibold">Public Link</h3>
            <p className="text-muted-foreground mb-3 text-sm">
              Your work is publicly visible at:
            </p>
            <div className="bg-background flex items-center gap-2 rounded-md border p-3">
              <code className="text-sm">/w/{work.slug}</code>
              <Button variant="ghost" size="sm" asChild className="ml-auto">
                <Link href={`/w/${work.slug}`} target="_blank">
                  View
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
