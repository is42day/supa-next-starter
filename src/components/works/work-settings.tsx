'use client'

import { useState } from 'react'
import { type Work } from '@/lib/db/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { updateWorkAction, deleteWorkAction } from '@/app/app/actions'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

type WorkSettingsProps = {
  work: Work
}

export function WorkSettings({ work }: WorkSettingsProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.append('workId', work.id)

    try {
      const result = await updateWorkAction(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setIsEditing(false)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    setError(null)

    try {
      const result = await deleteWorkAction(work.id)
      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/app')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (!isEditing) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Work Settings</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase">
              Title
            </p>
            <p className="mt-1">{work.title}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase">
              Description
            </p>
            <p className="mt-1">{work.description || 'No description'}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase">
              Slug
            </p>
            <p className="font-mono mt-1 text-sm">{work.slug}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase">
              Visibility
            </p>
            <p className="mt-1 capitalize">{work.visibility}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={work.title}
              required
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              defaultValue={work.description || ''}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={work.slug}
              required
              disabled={isSaving}
            />
            <p className="text-muted-foreground text-xs">
              Used in the URL: /w/{'{slug}'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select name="visibility" defaultValue={work.visibility}>
              <SelectTrigger id="visibility" disabled={isSaving}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private — Only you</SelectItem>
                <SelectItem value="unlisted">
                  Unlisted — Anyone with link
                </SelectItem>
                <SelectItem value="public">Public — Everyone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="text-destructive rounded-md bg-red-50 p-3 text-sm dark:bg-red-950/30">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button type="button" variant="destructive" size="sm">
                  Delete Work
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Work?</DialogTitle>
                  <DialogDescription>
                    This will permanently delete "{work.title}" and all its
                    chapters. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="ghost"
                    onClick={() => setShowDeleteDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsEditing(false)
                  setError(null)
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
