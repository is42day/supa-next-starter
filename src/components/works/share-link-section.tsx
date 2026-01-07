'use client'

import { useState } from 'react'
import { type WorkShare } from '@/lib/db/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createShareLinkAction } from '@/app/app/work/[workId]/actions'
import { Copy, Share2, Check } from 'lucide-react'

type ShareLinkSectionProps = {
  workId: string
  shares: WorkShare[]
}

export function ShareLinkSection({ workId, shares }: ShareLinkSectionProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  async function handleCreateShare() {
    setIsCreating(true)
    setError(null)

    try {
      const result = await createShareLinkAction(workId)
      if (result?.error) {
        setError(result.error)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsCreating(false)
    }
  }

  async function handleCopy(url: string, token: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedToken(token)
      setTimeout(() => setCopiedToken(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Share Links</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateShare}
            disabled={isCreating}
          >
            <Share2 className="mr-2 h-4 w-4" />
            {isCreating ? 'Creating...' : 'Create Link'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <div className="text-destructive rounded-md bg-red-50 p-3 text-sm dark:bg-red-950/30">
            {error}
          </div>
        )}

        {shares.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No share links yet. Create one to share your unlisted work.
          </p>
        ) : (
          <div className="space-y-2">
            {shares.map((share) => {
              const shareUrl = `${
                typeof window !== 'undefined'
                  ? window.location.origin
                  : 'http://localhost:3000'
              }/share/${share.token}`

              return (
                <div
                  key={share.id}
                  className="bg-muted flex items-center gap-2 rounded-md p-3"
                >
                  <Input
                    value={shareUrl}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(shareUrl, share.token)}
                  >
                    {copiedToken === share.token ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        )}

        <p className="text-muted-foreground text-xs">
          Share these links with others to give them access to your unlisted
          work. Anyone with the link can read it.
        </p>
      </CardContent>
    </Card>
  )
}
