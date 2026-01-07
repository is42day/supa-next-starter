'use client'

import { type Chapter } from '@/lib/db/types'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ChevronUp,
  ChevronDown,
  Edit,
  Trash2,
  GripVertical,
} from 'lucide-react'
import { reorderChapterAction, deleteChapterAction } from '@/app/app/work/[workId]/actions'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

type ChaptersListProps = {
  chapters: Chapter[]
  workId: string
}

export function ChaptersList({ chapters, workId }: ChaptersListProps) {
  return (
    <div className="space-y-2">
      {chapters.map((chapter, index) => (
        <ChapterItem
          key={chapter.id}
          chapter={chapter}
          workId={workId}
          isFirst={index === 0}
          isLast={index === chapters.length - 1}
        />
      ))}
    </div>
  )
}

type ChapterItemProps = {
  chapter: Chapter
  workId: string
  isFirst: boolean
  isLast: boolean
}

function ChapterItem({ chapter, workId, isFirst, isLast }: ChapterItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleReorder(direction: 'up' | 'down') {
    setError(null)
    const result = await reorderChapterAction(chapter.id, workId, direction)
    if (result?.error) {
      setError(result.error)
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    setError(null)

    try {
      const result = await deleteChapterAction(chapter.id, workId)
      if (result?.error) {
        setError(result.error)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="text-muted-foreground flex items-center">
          <GripVertical className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="truncate font-medium">
            {chapter.chapter_index + 1}. {chapter.title}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleReorder('up')}
            disabled={isFirst}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleReorder('down')}
            disabled={isLast}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="sm" asChild>
            <Link href={`/app/chapter/${chapter.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>

          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Chapter?</DialogTitle>
                <DialogDescription>
                  This will permanently delete "{chapter.title}". This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              {error && (
                <div className="text-destructive rounded-md bg-red-50 p-3 text-sm dark:bg-red-950/30">
                  {error}
                </div>
              )}
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
        </div>
      </CardContent>
    </Card>
  )
}
