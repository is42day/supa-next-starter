import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import { EnvVarWarning } from '@/components/env-var-warning'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { hasEnvVars } from '@/utils/env'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Suspense } from 'react'

async function AuthRedirect() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect authenticated users to dashboard
  if (user) {
    redirect('/app')
  }

  return null
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <Suspense fallback={null}>
        <AuthRedirect />
      </Suspense>
      <div className="flex w-full flex-1 flex-col items-center gap-20">
        <nav className="border-b-foreground/10 flex h-16 w-full justify-center border-b">
          <div className="flex w-full max-w-5xl items-center justify-between p-3 px-5 text-sm">
            <div className="flex items-center gap-5 font-semibold">
              <Link href={'/'}>WritingPlatform</Link>
            </div>
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href="/auth/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/sign-up">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </nav>
        <div className="flex max-w-5xl flex-1 flex-col gap-20 p-5">
          <div className="flex flex-col items-center gap-8 py-16 text-center">
            <h1 className="text-5xl font-bold tracking-tight">
              Share Your Stories
            </h1>
            <p className="text-muted-foreground max-w-2xl text-xl">
              A modern platform for writers to create, organize, and share their
              work. Build your portfolio, manage chapters, and connect with
              readers.
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg">
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>

        <footer className="mx-auto flex w-full items-center justify-center gap-8 border-t py-16 text-center text-xs">
          <p>
            Powered by{' '}
            <a
              href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  )
}
