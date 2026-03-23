-- ============================================================
-- ORBIT: Auth & Workspace Schema
-- Run this entire script in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles: mirrors auth.users, auto-populated via trigger
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT,
  email       TEXT        NOT NULL,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Workspaces
CREATE TABLE IF NOT EXISTS public.workspaces (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  owner_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_personal BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Workspace Members (composite PK — one row per user per workspace)
CREATE TABLE IF NOT EXISTS public.workspace_members (
  workspace_id UUID    NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id      UUID    NOT NULL REFERENCES public.profiles(id)   ON DELETE CASCADE,
  role         TEXT    NOT NULL DEFAULT 'member'
                       CHECK (role IN ('owner', 'admin', 'member')),
  joined_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (workspace_id, user_id)
);

-- Workspace Invites
CREATE TABLE IF NOT EXISTS public.workspace_invites (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID        NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email        TEXT        NOT NULL,
  invited_by   UUID        NOT NULL REFERENCES public.profiles(id)   ON DELETE CASCADE,
  -- secure random token generated at DB level (overridable from app)
  token        TEXT        NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status       TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'accepted')),
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIGGER: On new Supabase auth signup →
--   1. Create a profile row
--   2. Create a personal workspace
--   3. Add user as owner of that workspace
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace_id UUID;
  v_display_name TEXT;
BEGIN
  -- Prefer full_name (Google/MS SSO) → name → email prefix
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  -- 1. Profile
  INSERT INTO public.profiles (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    v_display_name,
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  -- 2. Personal workspace
  INSERT INTO public.workspaces (name, owner_id, is_personal)
  VALUES (v_display_name || '''s Workspace', NEW.id, TRUE)
  RETURNING id INTO v_workspace_id;

  -- 3. Add as owner member
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (v_workspace_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$;

-- Attach to auth.users (drop first to allow re-runs)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invites ENABLE ROW LEVEL SECURITY;

-- ---- profiles ----
-- Anyone authenticated can read profiles (needed for member lists)
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- Users may only update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- ---- workspaces ----
-- A user can see workspaces they're a member of
CREATE POLICY "workspaces_select_member" ON public.workspaces
  FOR SELECT TO authenticated USING (
    id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );

-- Any authenticated user can create a workspace (they become owner)
CREATE POLICY "workspaces_insert_owner" ON public.workspaces
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

-- Only the owner can update workspace metadata
CREATE POLICY "workspaces_update_owner" ON public.workspaces
  FOR UPDATE TO authenticated USING (owner_id = auth.uid());

-- Only the owner can delete the workspace
CREATE POLICY "workspaces_delete_owner" ON public.workspaces
  FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- ---- workspace_members ----
-- Members can view the member list of workspaces they belong to
CREATE POLICY "members_select" ON public.workspace_members
  FOR SELECT TO authenticated USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );

-- Owners and admins can add members
CREATE POLICY "members_insert_admin" ON public.workspace_members
  FOR INSERT TO authenticated WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Owners and admins can remove members; users can remove themselves
CREATE POLICY "members_delete_admin_or_self" ON public.workspace_members
  FOR DELETE TO authenticated USING (
    user_id = auth.uid()
    OR workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ---- workspace_invites ----
-- Workspace members and the invitee can see the invite
CREATE POLICY "invites_select" ON public.workspace_invites
  FOR SELECT TO authenticated USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
    OR email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

-- Only owners/admins can create invites
CREATE POLICY "invites_insert_admin" ON public.workspace_invites
  FOR INSERT TO authenticated WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- The invitee (matched by email) can accept (update status)
CREATE POLICY "invites_update_invitee" ON public.workspace_invites
  FOR UPDATE TO authenticated USING (
    email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );
