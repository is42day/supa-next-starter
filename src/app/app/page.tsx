import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import { getUserWorks, getProfile } from '@/lib/db/queries'
import { CreateWorkDialog } from '@/components/works/create-work-dialog'
import { WorksList } from '@/components/works/works-list'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Suspense } from 'react'

async function DashboardContent() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const profile = await getProfile(user.id)
  const works = await getUserWorks(user.id)

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Works</h1>
          {profile && (
            <p className="text-muted-foreground mt-1">
              Welcome back, {profile.display_name}
            </p>
          )}
        </div>
        <CreateWorkDialog />
      </div>

      {works.length === 0 ? (
        <div className="border-muted rounded-lg border-2 border-dashed p-12 text-center">
          <div className="mx-auto max-w-md">
            <h3 className="mb-2 text-lg font-semibold">No works yet</h3>
            <p className="text-muted-foreground mb-6 text-sm">
              Start your writing journey by creating your first work. It's a
              space for your thoughts, stories, and ideas.
            </p>
            <CreateWorkDialog variant="default" />
          </div>
        </div>
      ) : (
        <WorksList works={works} />
      )}

      {!profile && (
        <div className="bg-muted/50 mt-8 rounded-lg p-6">
          <h3 className="mb-2 font-semibold">Complete your profile</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Set up your profile to make your works more personal.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/app/settings">Go to Settings</Link>
          </Button>
        </div>
      )}
    </>
  )
}

export default function AppDashboardPage() {
  return (
    <div className="w-full">
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}
