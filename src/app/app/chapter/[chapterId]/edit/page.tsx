import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

type Params = Promise<{ chapterId: string }>

export default async function ChapterEditPage({ params }: { params: Params }) {
  const { chapterId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch chapter data
  const { data: chapter } = await supabase
    .from('chapters')
    .select('*, work:works!chapters_work_id_fkey(id, title)')
    .eq('id', chapterId)
    .single()

  if (!chapter) {
    return <div>Chapter not found</div>
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/app/work/${chapter.work_id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Work
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">{chapter.title}</h1>
        <p className="text-muted-foreground mt-2">
          Work: {chapter.work?.title}
        </p>
      </div>

      <div className="bg-muted rounded-lg p-8 text-center">
        <h2 className="mb-4 text-xl font-semibold">Chapter Editor Coming Soon</h2>
        <p className="text-muted-foreground mb-6">
          The rich text editor with autosave and version control will be
          implemented in Phase 2.
        </p>
        <p className="text-muted-foreground text-sm">
          Chapter ID: {chapterId}
        </p>
      </div>
    </div>
  )
}
