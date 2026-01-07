-- Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inline_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_shares ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Anyone can read public profile fields
CREATE POLICY "profiles_select_public"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update only their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- WORKS POLICIES
-- ============================================================================

-- Authors can read their own works
CREATE POLICY "works_select_own"
  ON public.works
  FOR SELECT
  USING (auth.uid() = author_id);

-- Everyone can read public works
CREATE POLICY "works_select_public"
  ON public.works
  FOR SELECT
  USING (visibility = 'public');

-- Authors can insert their own works
CREATE POLICY "works_insert_own"
  ON public.works
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Authors can update their own works
CREATE POLICY "works_update_own"
  ON public.works
  FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Authors can delete their own works
CREATE POLICY "works_delete_own"
  ON public.works
  FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================================================
-- CHAPTERS POLICIES
-- ============================================================================

-- Authors can read their own chapters
CREATE POLICY "chapters_select_own"
  ON public.chapters
  FOR SELECT
  USING (auth.uid() = author_id);

-- Everyone can read chapters of public works
CREATE POLICY "chapters_select_public"
  ON public.chapters
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.works
      WHERE works.id = chapters.work_id
      AND works.visibility = 'public'
    )
  );

-- Authors can insert chapters for their own works
CREATE POLICY "chapters_insert_own"
  ON public.chapters
  FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.works
      WHERE works.id = work_id
      AND works.author_id = auth.uid()
    )
  );

-- Authors can update their own chapters
CREATE POLICY "chapters_update_own"
  ON public.chapters
  FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Authors can delete their own chapters
CREATE POLICY "chapters_delete_own"
  ON public.chapters
  FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================================================
-- CHAPTER REVISIONS POLICIES
-- ============================================================================

-- Authors can read revisions of their own chapters
CREATE POLICY "revisions_select_own"
  ON public.chapter_revisions
  FOR SELECT
  USING (auth.uid() = author_id);

-- Authors can insert revisions for their own chapters
CREATE POLICY "revisions_insert_own"
  ON public.chapter_revisions
  FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.chapters
      WHERE chapters.id = chapter_id
      AND chapters.author_id = auth.uid()
    )
  );

-- ============================================================================
-- INLINE COMMENTS POLICIES
-- ============================================================================

-- Comment authors can read their own comments
CREATE POLICY "comments_select_own"
  ON public.inline_comments
  FOR SELECT
  USING (auth.uid() = author_id);

-- Work authors can read all comments on their chapters
CREATE POLICY "comments_select_work_author"
  ON public.inline_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chapters
      WHERE chapters.id = inline_comments.chapter_id
      AND chapters.author_id = auth.uid()
    )
  );

-- Authenticated users can create comments
CREATE POLICY "comments_insert_authenticated"
  ON public.inline_comments
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Work authors can update comment status (resolve)
CREATE POLICY "comments_update_work_author"
  ON public.inline_comments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.chapters
      WHERE chapters.id = inline_comments.chapter_id
      AND chapters.author_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chapters
      WHERE chapters.id = inline_comments.chapter_id
      AND chapters.author_id = auth.uid()
    )
  );

-- ============================================================================
-- CHAPTER FEEDBACK POLICIES
-- ============================================================================

-- Work authors can read feedback on their chapters
CREATE POLICY "feedback_select_work_author"
  ON public.chapter_feedback
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chapters
      WHERE chapters.id = chapter_feedback.chapter_id
      AND chapters.author_id = auth.uid()
    )
  );

-- Anyone can submit feedback (with or without account)
CREATE POLICY "feedback_insert_anyone"
  ON public.chapter_feedback
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- WORK SHARES POLICIES
-- ============================================================================

-- Work authors can read their own share tokens
CREATE POLICY "shares_select_own"
  ON public.work_shares
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.works
      WHERE works.id = work_shares.work_id
      AND works.author_id = auth.uid()
    )
  );

-- Work authors can create share tokens for their works
CREATE POLICY "shares_insert_own"
  ON public.work_shares
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.works
      WHERE works.id = work_id
      AND works.author_id = auth.uid()
    )
  );

-- Work authors can delete their own share tokens
CREATE POLICY "shares_delete_own"
  ON public.work_shares
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.works
      WHERE works.id = work_shares.work_id
      AND works.author_id = auth.uid()
    )
  );
