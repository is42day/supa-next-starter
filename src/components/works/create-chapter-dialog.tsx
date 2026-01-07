'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createChapterAction } from '@/app/app/work/[workId]/actions'
import { Plus } from 'lucide-react'

type CreateChapterDialogProps = {
  workId: string
  variant?: 'default' | 'outline' | 'ghost'
}

export function CreateChapterDialog({
  workId,
  variant = 'outline',
}: CreateChapterDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.append('workId', workId)

    try {
      const result = await createChapterAction(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setOpen(false)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Chapter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Chapter</DialogTitle>
          <DialogDescription>
            Give your chapter a title. You can start writing immediately after
            creating it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Chapter Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter chapter title"
              required
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && (
            <div className="text-destructive rounded-md bg-red-50 p-3 text-sm dark:bg-red-950/30">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Chapter'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
