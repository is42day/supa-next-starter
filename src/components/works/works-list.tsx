'use client'

import { type Work } from '@/lib/db/types'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FileText, Lock, Link as LinkIcon, Globe } from 'lucide-react'

type WorksListProps = {
  works: Work[]
}

export function WorksList({ works }: WorksListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {works.map((work) => (
        <Link key={work.id} href={`/app/work/${work.id}`}>
          <Card className="hover:border-primary transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="truncate">{work.title}</CardTitle>
                  <CardDescription className="mt-1.5">
                    {work.description || 'No description'}
                  </CardDescription>
                </div>
                <VisibilityBadge visibility={work.visibility} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  <span>/{work.slug}</span>
                </div>
                <div>
                  Updated{' '}
                  {formatDistanceToNow(new Date(work.updated_at), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

function VisibilityBadge({
  visibility,
}: {
  visibility: 'private' | 'unlisted' | 'public'
}) {
  const config = {
    private: {
      icon: Lock,
      label: 'Private',
      variant: 'secondary' as const,
    },
    unlisted: {
      icon: LinkIcon,
      label: 'Unlisted',
      variant: 'outline' as const,
    },
    public: {
      icon: Globe,
      label: 'Public',
      variant: 'default' as const,
    },
  }

  const { icon: Icon, label, variant } = config[visibility]

  return (
    <Badge variant={variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}
