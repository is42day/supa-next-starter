You are my senior full-stack engineer. Build an MVP for a writing-first platform: “writing space, not content feed”.
Tech constraints:
- Next.js App Router + TypeScript.
- Supabase (Auth + Postgres + Row Level Security).
- Tailwind + shadcn/ui components.
- Editor: use Plate (preferred) or Tiptap if Plate is too heavy. Must support: headings, bold/italic, lists, blockquote, code, links. Store content as JSON.
- NO likes, NO follower counts, NO algorithmic feed, NO infinite scroll.
- Calm typography-first reading experience with day/night mode.
- Chapters, shareable reading link, inline comments, end-of-chapter feedback prompts, and version history.

Start from an existing Next.js + Supabase + shadcn starter (repo already has auth + env + basic layout).
Implement the following:

1) DATA MODEL (Supabase Postgres)
Create SQL migrations (or Supabase SQL) for:
- profiles: id (uuid pk, references auth.users), handle (text unique), display_name (text), created_at.
- works: id (uuid pk), author_id (uuid fk -> profiles.id), title (text), description (text null), visibility (text enum: 'private','unlisted','public'), slug (text unique), created_at, updated_at.
- chapters: id (uuid pk), work_id (uuid fk -> works.id), author_id (uuid fk -> profiles.id), chapter_index (int), title (text), content_json (jsonb), created_at, updated_at.
- chapter_revisions: id (uuid pk), chapter_id (uuid fk), author_id (uuid fk), content_json (jsonb), created_at, summary (text null).
- inline_comments: id (uuid pk), chapter_id (uuid fk), author_id (uuid fk), anchor (jsonb describing selection: from/to positions + quote text), body (text), status (text enum: 'open','resolved'), created_at, resolved_at null.
- chapter_feedback: id (uuid pk), chapter_id (uuid fk), reader_id (uuid null), answers (jsonb: { whatWorked, whereLostInterest, favoriteLine }), created_at.

2) SECURITY / RLS
Enable RLS and implement policies:
- profiles: users can read all public profile fields; users can update only their own profile.
- works: author can CRUD their works; everyone can read works with visibility='public'; anyone with direct link can read 'unlisted' work only through server route (see below).
- chapters: author can CRUD; readers can read chapters only if the parent work is public OR (unlisted and they have the share token) OR they are the author.
- comments: author of work/chapter can read all comments; comment author can read their own; only comment author can create; work author can resolve.
- feedback: anyone with access to chapter can submit; work author can read.

3) ROUTES / PAGES (App Router)
Implement:
- /app/(auth)/... existing auth stays.
- /app/app (dashboard): list my works, create new work.
- /app/app/work/[workId]: manage work settings, list chapters, create chapter, reorder chapters (simple up/down).
- /app/app/chapter/[chapterId]/edit: editor page with autosave and “Save revision” button.
- /w/[slug]: reading mode for a work (typography-first), shows chapter list, remembers last read chapter in localStorage.
- /w/[slug]/c/[chapterIndex]: reading mode for a single chapter with progress indicator, day/night toggle.
- /w/[slug]/c/[chapterIndex]/respond: end-of-chapter feedback form (3 prompts).
- /share/[token]: token-based access for unlisted works (server-side). Token maps to a work id and sets a signed cookie for access.

4) SHARE LINKS (Unlisted)
Implement share tokens:
- table work_shares: id, work_id, token (random), created_at, expires_at null.
- dashboard button “Create share link” for unlisted works.
- /share/[token] validates token, sets httpOnly cookie “work_access” with allowed work_id(s), then redirects to /w/[slug].
- reading routes check: public works allowed; unlisted allowed if cookie grants access.

5) EDITOR / AUTOSAVE / VERSIONS
Editor requirements:
- Use Plate or Tiptap component with shadcn styling.
- Load chapter content_json into editor state.
- Autosave debounce (e.g., 1–2 seconds) writing to chapters.content_json and updated_at.
- “Save revision” button inserts row into chapter_revisions with current content_json and optional summary.
- Add a “Version history” drawer: list revisions, preview, and “Restore this revision” (overwrites chapter content_json).

6) INLINE COMMENTS
In reading mode:
- Allow selecting text in chapter and clicking “Comment”.
- Store anchor = { chapterId, from, to, quote, contextBefore, contextAfter } to survive minor edits.
- Render comment highlights in reading view (best-effort; if exact positions mismatch, fallback to quote search).
- Thread view sidebar: list comments, jump to highlight, resolve toggle for author.

7) UI / UX PRINCIPLES
- No feed page.
- Dashboard is “Your works” only.
- Reading mode typography-first (max width, good line height).
- Day/night toggle persisted in localStorage.
- No emojis reactions.
- Add subtle, calm empty states and loading states.

8) CODE ORGANIZATION
Use a maintainable structure:
- /lib/supabase/{client.ts,server.ts}
- /lib/db/{queries.ts,types.ts}
- /components/editor/...
- /components/reading/...
- /app/app/... and /app/w/...
Prefer server components for fetching; client components only for editor, toggles, comment selection UI.
Use Zod for input validation in server actions.

9) DELIVERABLES
Generate:
- SQL migration(s) for the schema + RLS policies.
- Core queries/helpers.
- All pages and components described above.
- Minimal but working styling with shadcn/ui.
- Seed script optional.

Work incrementally:
First output the SQL migrations + RLS.
Then output the Next.js code file-by-file with clear paths.
Avoid placeholder code where possible; produce runnable MVP.