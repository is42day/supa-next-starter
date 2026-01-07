# Quick Reference Guide

## Installation & Setup

### 1. Install Dependencies
```bash
pnpm add @radix-ui/react-dialog @radix-ui/react-select zod date-fns
pnpm add -D @types/date-fns
```

### 2. Run Database Migrations

**Using Supabase CLI (Recommended):**
```bash
npx supabase db push
```

**Or manually in Supabase Dashboard:**
1. SQL Editor → New Query
2. Copy content from `supabase/migrations/20260107000001_initial_schema.sql`
3. Run query
4. Repeat with `supabase/migrations/20260107000002_rls_policies.sql`

### 3. Verify Environment Variables
Your `.env.local` should have:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

### 4. Start Development
```bash
pnpm dev
```

## Usage Routes

| Route | Purpose | Auth Required |
|-------|---------|-----------------|
| `/` | Home page | No |
| `/auth/login` | Sign in | No |
| `/auth/sign-up` | Create account | No |
| `/app` | Dashboard - your works | **Yes** |
| `/app/work/[id]` | Manage work (chapters, settings) | **Yes** |
| `/w/[slug]` | Read published work | No (public) |
| `/w/[slug]/c/[index]` | Read chapter | No (public) |
| `/share/[token]` | Access unlisted work | Requires valid token |

## Common Tasks

### Create a Work
1. Go to `/app`
2. Click "New Work" button
3. Enter title, description, visibility
4. Redirects to work management page

### Add a Chapter
1. On work page (`/app/work/[id]`)
2. Click "New Chapter" button
3. Enter chapter title
4. Redirects to editor (after Phase 2)

### Reorder Chapters
1. On work page
2. Use up/down arrows next to each chapter
3. Changes persist immediately

### Generate Share Link
1. Set work visibility to "Unlisted"
2. On work page, see "Share Links" section
3. Click "Create Link"
4. Copy the link to share with others

### Delete a Work
1. On work page, click "Edit" in settings
2. Click "Delete Work" button
3. Confirm deletion

## Database Schema Quick Reference

### works table
```javascript
{
  id: uuid,                          // Primary key
  author_id: uuid,                   // FK to profiles
  title: string,                     // 1-200 chars
  description?: string,              // Optional
  visibility: 'private' | 'unlisted' | 'public',
  slug: string,                      // Unique, URL-safe
  created_at: timestamp,
  updated_at: timestamp
}
```

### chapters table
```javascript
{
  id: uuid,
  work_id: uuid,                     // FK to works
  author_id: uuid,
  chapter_index: number,             // 0-based
  title: string,
  content_json: jsonb,               // Editor state
  created_at: timestamp,
  updated_at: timestamp
}
```

### chapter_revisions table
```javascript
{
  id: uuid,
  chapter_id: uuid,
  author_id: uuid,
  content_json: jsonb,               // Snapshot of content
  summary?: string,                  // User's save note
  created_at: timestamp
}
```

## API Query Examples

### Get User's Works
```typescript
import { getUserWorks } from '@/lib/db/queries'

const works = await getUserWorks(userId)
```

### Create a Work
```typescript
import { createWork } from '@/lib/db/queries'

const work = await createWork(
  userId,
  'My Story',
  'my-story',
  'A tale of adventure',
  'private'
)
```

### Get Work with Chapters
```typescript
import { getWorkWithChapters } from '@/lib/db/queries'

const work = await getWorkWithChapters(workId)
// Returns: { ...work, chapters: [...], author: {...} }
```

### Create a Chapter
```typescript
import { createChapter } from '@/lib/db/queries'

const chapter = await createChapter(
  workId,
  authorId,
  'Chapter One: Beginning',
  0,  // chapter index
  []  // initial content (empty Plate editor state)
)
```

### Get Chapters Ordered
```typescript
import { getWorkChapters } from '@/lib/db/queries'

const chapters = await getWorkChapters(workId)
// Auto-sorted by chapter_index
```

### Create Share Link
```typescript
import { createWorkShare, generateToken } from '@/lib/db/queries'

const token = generateToken(32)
const share = await createWorkShare(workId, token)
// Share URL: /share/{token}
```

## Server Action Pattern

All mutations use server actions in `actions.ts` files:

```typescript
'use server'

import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function myAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/auth/login')
  
  // Do something...
  
  revalidatePath('/app')  // Refresh cached pages
  redirect('/somewhere')   // Navigate after action
}
```

## Component Patterns

### Client Component with Dialog
```typescript
'use client'

import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function MyDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent>
        {/* Modal content */}
      </DialogContent>
    </Dialog>
  )
}
```

### Form with Server Action
```typescript
'use client'

import { myAction } from '@/app/actions'

export function MyForm() {
  return (
    <form action={myAction}>
      <input name="title" />
      <button type="submit">Submit</button>
    </form>
  )
}
```

## Debugging Tips

### Check RLS Policies
If you're getting "permission denied" errors:
1. Go to Supabase Dashboard
2. Authentication → Users (verify user exists)
3. SQL Editor → Run: `SELECT * FROM profiles WHERE id = 'your-user-id'`
4. Check row-level security policies are enabled

### View Database Logs
```bash
# Supabase Dashboard → Logs → Auth or Database
# Look for 401/403 errors from RLS
```

### Type Check
```bash
pnpm type-check
```

### Lint Check
```bash
pnpm lint
```

## File Organization

```
src/
├── app/
│   └── app/                    # All authenticated pages
│       ├── page.tsx            # Dashboard
│       ├── actions.ts          # Work mutations
│       └── work/[workId]/      # Work detail page
│
├── components/
│   ├── works/                  # Work-specific components
│   └── ui/                     # shadcn/ui components
│
├── lib/
│   └── db/                     # Database layer
│       ├── types.ts            # TypeScript types
│       └── queries.ts          # Query helpers
│
└── supabase/
    ├── client.ts               # Browser Supabase
    └── server.ts               # Server Supabase
```

## Next Steps for Phase 2

### 1. Build Editor
```bash
pnpm add @udecode/plate-common @udecode/plate-basic-marks
```

Create: `src/components/editor/plate-editor.tsx`

### 2. Create Reading Pages
- `src/app/w/[slug]/page.tsx`
- `src/app/w/[slug]/c/[index]/page.tsx`

### 3. Implement Share Route
- `src/app/share/[token]/route.ts`

See `IMPLEMENTATION_PROGRESS.md` for detailed tasks.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "User not logged in" | Redirect to `/auth/login` happening - check auth |
| "Permission denied" RLS error | Check row security policies - enable if disabled |
| Slug not unique | Increment counter: `slug-1`, `slug-2`, etc. |
| Share link not working | Ensure work visibility is 'unlisted' |
| Changes not showing | Run `revalidatePath()` in server action |
| Type errors | Check TypeScript - run `pnpm type-check` |

## Performance Notes

- ✅ Queries use indexes on `author_id`, `work_id`, `status`, etc.
- ✅ RLS evaluates at row level (no SELECT * performance issues)
- ✅ Server actions only revalidate changed paths
- ⏳ Next: Add caching for public works in Phase 2

---

**More details? See:**
- `PHASE_1_SUMMARY.md` - Big picture overview
- `IMPLEMENTATION_PROGRESS.md` - Detailed progress & next steps
- `PROJECT_STRUCTURE.md` - File organization
- `.github/copilot-instructions.md` - AI coding guidelines
