# 📖 Writing Platform MVP - Complete Overview

## What This Project Is

A **writing-first platform** built on Next.js + Supabase, focused on creating and sharing written works with chapters, comments, and feedback—without social features like feeds, likes, or follower counts.

Think of it as: **Medium meets a private notebook**

## Current Status: Phase 1 ✅ Complete

### ✅ What Works Today
- User authentication (sign up, login)
- Create & manage works (private/unlisted/public)
- Add, reorder, and delete chapters
- Generate share links for unlisted works
- Edit work settings
- Type-safe database layer with RLS security
- Fully responsive UI

### ❌ What Doesn't Work Yet
- Writing/editing chapter content (editor not built)
- Reading published chapters (reading UI not built)
- Accessing unlisted works via share link (route not implemented)
- Comments, feedback, version history (Phase 3)

## Quick Start (5 minutes)

```bash
# 1. Install dependencies
pnpm add @radix-ui/react-dialog @radix-ui/react-select zod date-fns

# 2. Run migrations (choose one)
# Option A: Supabase CLI
npx supabase db push

# Option B: Supabase Dashboard → SQL Editor → paste migrations

# 3. Start
pnpm dev

# 4. Visit
# http://localhost:3000/auth/login → http://localhost:3000/app
```

## File Locations

### Core Features
| Feature | File(s) |
|---------|---------|
| Dashboard | `src/app/app/page.tsx` |
| Work Management | `src/app/app/work/[workId]/page.tsx` |
| Database Queries | `src/lib/db/queries.ts` |
| Database Types | `src/lib/db/types.ts` |
| Server Actions | `src/app/app/actions.ts`, `work/[id]/actions.ts` |
| Components | `src/components/works/*.tsx` |
| Migrations | `supabase/migrations/*.sql` |

### Documentation
| File | Purpose |
|------|---------|
| `PHASE_1_SUMMARY.md` | Detailed Phase 1 overview |
| `IMPLEMENTATION_PROGRESS.md` | What's done, what's next |
| `QUICK_REFERENCE.md` | Commands, patterns, troubleshooting |
| `PHASE_2_STARTERS.md` | Code templates for next phase |
| `PROJECT_STRUCTURE.md` | File organization |
| `WRITING_PLATFORM_README.md` | Installation guide |

## Architecture at a Glance

```
┌─────────────────────────────────────┐
│  Next.js 16 (App Router + React 19) │
└──────────────┬──────────────────────┘
               │
     ┌─────────┴──────────┬──────────────┐
     │                    │              │
┌────▼─────┐        ┌────▼──────┐  ┌───▼─────┐
│  Server   │        │  Client   │  │Middleware│
│Components │        │Components │  │(Auth)   │
│(Data)     │        │(Interaction)  │        │
└────┬─────┘        └────┬──────┘  └───┬─────┘
     │                   │              │
     └───────────┬───────┴──────────────┘
                 │
         ┌───────▼────────┐
         │ Server Actions │ (type-safe mutations)
         └────────┬───────┘
                  │
        ┌─────────▼──────────┐
        │ Supabase Database  │
        │ + RLS + Migrations │
        └────────────────────┘
```

### Key Patterns
1. **Server Components** (default) → fetch data
2. **Client Components** ('use client') → handle interaction
3. **Server Actions** (mutations) → database writes
4. **RLS Policies** → security at database level
5. **Query Helpers** → consistent data access

## Security Model

### What's Protected
✅ Users can only create/edit their own works  
✅ Users can't access others' private works  
✅ RLS prevents unauthorized reads at database level  
✅ Share tokens are random and hard to guess  
✅ Cookies for share token access validation

### What's Not Yet Protected
⚠️ Middleware validation for share tokens (Phase 2)  
⚠️ Rate limiting on share link creation  
⚠️ Comment moderation tools

## Data Model

### 7 Tables
1. **profiles** - User profiles with handles
2. **works** - User's written works
3. **chapters** - Chapters within works
4. **chapter_revisions** - Version history
5. **inline_comments** - Text comments
6. **chapter_feedback** - Reader feedback
7. **work_shares** - Share tokens for unlisted works

### Relationships
```
auth.users (1:1) → profiles
profiles (1:many) → works
works (1:many) → chapters
chapters (1:many) → {
  chapter_revisions,
  inline_comments,
  chapter_feedback
}
works (1:many) → work_shares
```

## Routes Overview

### Authenticated Routes (`/app`)
- `/app` - Dashboard (list your works)
- `/app/work/[id]` - Manage work & chapters

### Public Routes (`/w`)
- `/w/[slug]` - Read published work
- `/w/[slug]/c/[index]` - Read chapter
- `/share/[token]` - Access unlisted work (Phase 2)

### Feedback Routes
- `/w/[slug]/c/[index]/respond` - Leave feedback (Phase 3)

## What Happens When You...

### Create a Work
```
User fills form → Server action validates → 
  Creates row in works table → Redirects to work page
```

### Add a Chapter
```
User clicks "New Chapter" → Dialog appears → 
  Submits title → Server creates chapter_index → 
  Redirects to editor (Phase 2)
```

### Generate Share Link
```
User clicks "Create Link" → Generate 32-char token →
  Insert into work_shares → Copy to clipboard →
  Share URL: /share/[token]
```

## Testing Checklist

Before moving to Phase 2:
- [ ] Sign up works
- [ ] Create a work
- [ ] Add 3+ chapters
- [ ] Reorder chapters
- [ ] Edit work title/slug
- [ ] Change visibility (private → unlisted → public)
- [ ] Generate share link
- [ ] Copy link works
- [ ] Delete chapter (with confirmation)
- [ ] Works persist after page refresh
- [ ] Cannot see others' private works
- [ ] Mobile layout looks good
- [ ] Dark mode works

## Phase 2: What's Next (4-6 hours)

### Priority 1: Chapter Editor
- Install Plate.js or Tiptap
- Build editor component
- Implement autosave (1-2sec debounce)
- Create revision system
- Build version history drawer

### Priority 2: Reading Mode
- Create `/w/[slug]` landing page
- Create `/w/[slug]/c/[index]` reading page
- Implement typography-first design
- Add chapter navigation
- Save reading progress (localStorage)

### Priority 3: Share System
- Create `/share/[token]` redirect route
- Set httpOnly cookie for access
- Add middleware validation

## Phase 3: Nice-to-Haves (4-6 hours)

### Inline Comments
- Text selection → comment creation
- Anchor positions with fallback
- Comment thread sidebar
- Resolve comments (author only)

### Feedback Forms
- 3-question forms at chapter end
- Anonymous submission option
- Author dashboard to view responses
- Sentiment analysis (future)

## Code Quality

### Type Safety
✅ Full TypeScript coverage  
✅ Database types match schema  
✅ Server action validation with Zod  
✅ Type-safe client/server boundary

### Testing
✅ Manual testing checklist provided  
⏳ Unit tests (future)  
⏳ Integration tests (future)

### Performance
✅ Database indexes on common queries  
✅ Server actions only revalidate changed paths  
✅ Debounced autosave (not on every keystroke)  
⏳ Caching for public works (Phase 2)

## Deployment Checklist

Before going live:
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] RLS policies verified
- [ ] Auth domain configured
- [ ] CORS settings correct
- [ ] Vercel/hosting configured
- [ ] Secrets management reviewed
- [ ] Backup strategy planned

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Permission denied" RLS | Check RLS enabled in Supabase console |
| User not logged in | Verify auth token in cookies |
| Share link 404 | Check work visibility is 'unlisted' |
| Slug not unique | Auto-increment: `slug-1`, `slug-2` |
| Changes not showing | Call `revalidatePath()` in server action |

## Learning Resources

- **Next.js App Router**: nextjs.org/docs
- **Supabase**: supabase.com/docs
- **shadcn/ui**: ui.shadcn.com
- **Plate.js**: platejs.org (for editor)
- **Row-level security**: supabase.com/docs/guides/auth/row-level-security

## Development Workflow

```bash
# 1. Make changes to code
# 2. Check for type errors
pnpm type-check

# 3. Lint & format
pnpm lint-fix
pnpm format

# 4. Test in browser
pnpm dev

# 5. Build & verify
pnpm build

# 6. Commit & push
git add .
git commit -m "..."
git push
```

## Git Ignore

Already configured in `.gitignore`:
- `node_modules/`
- `.next/`
- `.env.local`
- `dist/`

## Team Handoff

### For Frontend Dev
- See `QUICK_REFERENCE.md` for UI patterns
- See `PHASE_2_STARTERS.md` for editor code
- Component location: `src/components/`

### For Backend Dev
- See `IMPLEMENTATION_PROGRESS.md` for DB design
- See `src/lib/db/queries.ts` for API
- Migrations: `supabase/migrations/`

### For Designer
- Design system: Tailwind CSS + shadcn/ui
- Colors: Tailwind defaults with dark mode
- Typography: Geist font family
- Icons: Lucide React

---

## Quick Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm type-check       # Check TypeScript
pnpm lint             # Find issues
pnpm format           # Auto-format code

# Testing
pnpm test             # Run tests
pnpm test:ui          # Test UI

# Build
pnpm build            # Production build
pnpm start            # Run production server

# Database
npx supabase db push  # Run migrations
```

---

## FAQ

**Q: Why no likes/follows/feeds?**  
A: Writing-first philosophy. Focus on creation, not metrics.

**Q: Why Plate.js over Tiptap?**  
A: Plate is more React-native, but Tiptap works too. Your choice.

**Q: Can I export chapters?**  
A: Not in MVP. Future feature: markdown, PDF export.

**Q: Will this scale?**  
A: Yes. Supabase scales to millions of users. Add caching in Phase 2.

**Q: What about mobile apps?**  
A: Start with web. Native apps after MVP.

**Q: Is this open source?**  
A: Depends on your license. MIT is good default.

---

**Status: Ready for Phase 2 ✅**

**Next: Pick editor or reading mode, implement fully, then move to the other.**

See `PHASE_2_STARTERS.md` for code templates to get started.

Questions? Check the documentation files or trace through the code—it's all well-structured.

🚀 **Let's build something amazing!**
