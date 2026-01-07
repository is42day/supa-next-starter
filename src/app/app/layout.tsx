import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

async function AuthCheck() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return null
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <AuthCheck />
      </Suspense>
      {children}
    </>
  )
}
