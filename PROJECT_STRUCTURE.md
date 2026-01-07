# Project File Structure

## New Files Created for Writing Platform

```
supa-next-starter/
├── .github/
│   └── copilot-instructions.md
│
├── supabase/
│   └── migrations/
│       ├── 20260107000001_initial_schema.sql
│       └── 20260107000002_rls_policies.sql
│
├── src/
│   ├── app/
│   │   ├── app/
│   │   │   ├── page.tsx (Dashboard - list works)
│   │   │   ├── actions.ts (Work CRUD server actions)
│   │   │   └── work/
│   │   │       └── [workId]/
│   │   │           ├── page.tsx (Work management)
│   │   │           └── actions.ts (Chapter & share actions)
│   │   │
│   │   ├── auth/ (existing)
│   │   ├── protected/ (existing)
│   │   ├── globals.css (existing)
│   │   ├── layout.tsx (existing)
│   │   └── page.tsx (existing)
│   │
│   ├── components/
│   │   ├── works/ (NEW)
│   │   │   ├── create-work-dialog.tsx
│   │   │   ├── works-list.tsx
│   │   │   ├── work-settings.tsx
│   │   │   ├── create-chapter-dialog.tsx
│   │   │   ├── chapters-list.tsx
│   │   │   └── share-link-section.tsx
│   │   │
│   │   ├── ui/
│   │   │   ├── dialog.tsx (NEW)
│   │   │   ├── select.tsx (NEW)
│   │   │   ├── button.tsx (existing)
│   │   │   ├── card.tsx (existing)
│   │   │   ├── input.tsx (existing)
│   │   │   └── ... (other existing components)
│   │   │
│   │   ├── auth-button.tsx (existing)
│   │   ├── theme-switcher.tsx (existing)
│   │   └── ... (other existing components)
│   │
│   ├── lib/
│   │   └── db/ (NEW)
│   │       ├── types.ts (All database types)
│   │       └── queries.ts (Query helper functions)
│   │
│   ├── supabase/
│   │   ├── client.ts (existing)
│   │   ├── server.ts (existing)
│   │   └── proxy.ts (existing)
│   │
│   └── utils/ (existing)
│       ├── env.ts
│       └── tailwind.ts
│
├── WRITING_PLATFORM_README.md (NEW - Setup instructions)
├── IMPLEMENTATION_PROGRESS.md (NEW - This phase summary)
└── PROJECT_STRUCTURE.md (NEW - File organization)
```

## File Size & Complexity

| File | Lines | Purpose |
|------|-------|---------|
| migrations/schema.sql | ~120 | Table definitions with constraints |
| migrations/rls.sql | ~180 | Row level security policies |
| lib/db/types.ts | ~140 | TypeScript type definitions |
| lib/db/queries.ts | ~350+ | Database query helpers |
| app/app/page.tsx | ~50 | Dashboard page |
| app/app/actions.ts | ~110 | Work CRUD actions |
| app/work/[id]/page.tsx | ~60 | Work management page |
| app/work/[id]/actions.ts | ~140 | Chapter management actions |
| components/works/* | ~600 total | Work-related UI components |
| components/ui/dialog.tsx | ~120 | Dialog/Modal component |
| components/ui/select.tsx | ~140 | Select dropdown component |

**Total new code: ~2,000 lines**

## Database Schema Overview

### Tables (7)
1. **profiles** - User profiles with handle and bio
2. **works** - User's written works with visibility
3. **chapters** - Chapters within works
4. **chapter_revisions** - Version history for chapters
5. **inline_comments** - Comments on chapter text
6. **chapter_feedback** - Reader feedback forms
7. **work_shares** - Token-based share links

### Relationships
```
auth.users
    ↓
profiles (1:1)
    ↓
works (1:many)
    ├→ chapters (1:many)
    │   ├→ chapter_revisions (1:many)
    │   ├→ inline_comments (1:many)
    │   └→ chapter_feedback (1:many)
    └→ work_shares (1:many)
```

## Development Workflow

### Setup
```bash
# 1. Install dependencies
pnpm install
pnpm add @radix-ui/react-dialog @radix-ui/react-select zod date-fns

# 2. Run migrations (via Supabase CLI or Dashboard)
# 3. Set environment variables in .env.local
# 4. Start development
pnpm dev
```

### Testing Routes
```
http://localhost:3000/           - Home page
http://localhost:3000/auth/login - Login
http://localhost:3000/app        - Dashboard (logged in)
http://localhost:3000/app/work/[id] - Work management
```

## Key Design Decisions

### 1. Server Actions for All Mutations
- ✅ Type-safe
- ✅ Can revalidate cache
- ✅ CSRF protection built-in
- ✅ Server-side validation with Zod

### 2. Query Helpers in `/lib/db/`
- ✅ Centralized database access
- ✅ Consistent error handling
- ✅ Easy to audit
- ✅ Reusable across components

### 3. RLS for Security
- ✅ Database-level enforcement
- ✅ Can't be bypassed from frontend
- ✅ Policies prevent unauthorized access
- ✅ Row-level granularity

### 4. Slug + UUID for Works
- ✅ Human-readable URLs
- ✅ UUIDs for internal references
- ✅ Unique slug per user

### 5. Share Tokens for Unlisted Works
- ✅ Simple and secure
- ✅ Can be regenerated
- ✅ Can expire
- ✅ No need for user accounts

## Next Steps

### Phase 2: Editor & Reading (Priority)
1. Chapter editor with Plate (rich text)
2. Autosave with debouncing
3. Version history/revisions
4. Reading mode pages (typography-first)
5. Share token validation route

### Phase 3: Interactivity
1. Inline comments with text selection
2. Comment highlighting and threads
3. End-of-chapter feedback forms
4. Reader analytics dashboard

### Phase 4: Polish
1. User profile page
2. Settings/preferences
3. Search and filtering
4. Export features
5. Share on social media

---

**Status: MVP Core (Phase 1) ✅ Complete**
