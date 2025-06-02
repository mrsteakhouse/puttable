-- Migration to consolidate RLS policies for roles, scorecards, and users

-- First, drop the existing update policies for sessions
DROP POLICY IF EXISTS "Enable update for users with edit_sessions permission" ON "public"."sessions";
DROP POLICY IF EXISTS "Enable update for session owners" ON "public"."sessions";

-- Create a consolidated update policy for sessions
CREATE POLICY "Enable update for users with sessions permissions" ON "public"."sessions"
FOR UPDATE TO authenticated
    USING (public.user_has_permission((select auth.uid()), 'sessions', 'read'))
WITH CHECK (
     (public.user_has_permission((select auth.uid()), 'sessions', 'update')) OR
     (public.user_has_permission((select auth.uid()), 'sessions', 'submit') AND submitted_at IS NULL));

-- First, drop the existing policies for roles
DROP POLICY IF EXISTS "Allow admin to execute list_users_with_roles" ON "public"."roles";
DROP POLICY IF EXISTS "Allow admin to execute list_roles_with_permissions" ON "public"."roles";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."roles";

-- Create a consolidated read policy for roles
CREATE POLICY "Enable read access for all users and admin functions" ON "public"."roles"
FOR SELECT TO authenticated
USING (true);

-- Drop the existing read policies for users
DROP POLICY IF EXISTS "Users can view their own user data" ON "public"."users";
DROP POLICY IF EXISTS "Enable read access for admins" ON "public"."users";

-- Create a consolidated read policy for users
CREATE POLICY "Enable read access for own data and admins" ON "public"."users"
FOR SELECT TO authenticated
USING (
    (select auth.uid()) = id OR
    public.user_has_permission((select auth.uid()), '*', '*')
);

-- Replace all direct calls to auth.uid() with (select auth.uid()) in all RLS policies
-- Update policies in tournaments table
DROP POLICY IF EXISTS "Enable insert for users with create_tournaments permission" ON "public"."tournaments";
CREATE POLICY "Enable insert for users with create_tournaments permission" ON "public"."tournaments"
FOR INSERT TO authenticated
WITH CHECK (
    public.user_has_permission((select auth.uid()), 'tournaments', 'create')
);

DROP POLICY IF EXISTS "Enable update for users with edit_tournaments permission" ON "public"."tournaments";
CREATE POLICY "Enable update for users with edit_tournaments permission" ON "public"."tournaments"
FOR UPDATE TO authenticated
USING (public.user_has_permission((select auth.uid()), 'tournaments', 'read'))
WITH CHECK (
    public.user_has_permission((select auth.uid()), 'tournaments', 'update')
);

DROP POLICY IF EXISTS "Enable delete for users with delete_tournaments permission" ON "public"."tournaments";
CREATE POLICY "Enable delete for users with delete_tournaments permission" ON "public"."tournaments"
FOR DELETE TO authenticated
USING (
    public.user_has_permission((select auth.uid()), 'tournaments', 'delete')
);

DROP POLICY IF EXISTS "Enable read access for users with read permission" ON "public"."tournaments";
CREATE POLICY "Enable read access for users with read permission" ON "public"."tournaments"
FOR SELECT TO authenticated
USING (public.user_has_permission((select auth.uid()), 'tournaments', 'read'));

-- Update policies in sessions table
DROP POLICY IF EXISTS "Enable insert for users with create_sessions permission" ON "public"."sessions";
CREATE POLICY "Enable insert for users with create_sessions permission" ON "public"."sessions"
FOR INSERT TO authenticated
WITH CHECK (
    public.user_has_permission((select auth.uid()), 'sessions', 'create')
);

DROP POLICY IF EXISTS "Enable delete for users with delete_sessions permission" ON "public"."sessions";
CREATE POLICY "Enable delete for users with delete_sessions permission" ON "public"."sessions"
FOR DELETE TO authenticated
USING (
    public.user_has_permission((select auth.uid()), 'sessions', 'delete')
);

DROP POLICY IF EXISTS "Enable read access for users with read permission" ON "public"."sessions";
CREATE POLICY "Enable read access for users with read permission" ON "public"."sessions"
FOR SELECT TO authenticated
USING (public.user_has_permission((select auth.uid()), 'sessions', 'read'));

-- Update policies in players table
DROP POLICY IF EXISTS "Enable insert for users with create_players permission" ON "public"."players";
CREATE POLICY "Enable insert for users with create_players permission" ON "public"."players"
FOR INSERT TO authenticated
WITH CHECK (
    public.user_has_permission((select auth.uid()), 'players', 'create')
);

DROP POLICY IF EXISTS "Enable update for users with edit_players permission" ON "public"."players";
CREATE POLICY "Enable update for users with edit_players permission" ON "public"."players"
FOR UPDATE TO authenticated
USING (public.user_has_permission((select auth.uid()), 'players', 'read'))
WITH CHECK (
    public.user_has_permission((select auth.uid()), 'players', 'update')
);

DROP POLICY IF EXISTS "Enable delete for users with delete_players permission" ON "public"."players";
CREATE POLICY "Enable delete for users with delete_players permission" ON "public"."players"
FOR DELETE TO authenticated
USING (
    public.user_has_permission((select auth.uid()), 'players', 'delete')
);

DROP POLICY IF EXISTS "Enable read access for users with read permission" ON "public"."players";
CREATE POLICY "Enable read access for users with read permission" ON "public"."players"
FOR SELECT TO authenticated
USING (public.user_has_permission((select auth.uid()), 'players', 'read'));

-- Update policies in rating_classes table
DROP POLICY IF EXISTS "Enable insert for users with create_rating_classes permission" ON "public"."rating_classes";
CREATE POLICY "Enable insert for users with create_rating_classes permission" ON "public"."rating_classes"
FOR INSERT TO authenticated
WITH CHECK (
    public.user_has_permission((select auth.uid()), 'rating_classes', 'create')
);

DROP POLICY IF EXISTS "Enable update for users with edit_rating_classes permission" ON "public"."rating_classes";
CREATE POLICY "Enable update for users with edit_rating_classes permission" ON "public"."rating_classes"
FOR UPDATE TO authenticated
USING (public.user_has_permission((select auth.uid()), 'rating_classes', 'read'))
WITH CHECK (
    public.user_has_permission((select auth.uid()), 'rating_classes', 'update')
);

DROP POLICY IF EXISTS "Enable delete for users with delete_rating_classes permission" ON "public"."rating_classes";
CREATE POLICY "Enable delete for users with delete_rating_classes permission" ON "public"."rating_classes"
FOR DELETE TO authenticated
USING (
    public.user_has_permission((select auth.uid()), 'rating_classes', 'delete')
);

DROP POLICY IF EXISTS "Enable read access for users with read permission" ON "public"."rating_classes";
CREATE POLICY "Enable read access for users with read permission" ON "public"."rating_classes"
FOR SELECT TO authenticated
USING (public.user_has_permission((select auth.uid()), 'rating_classes', 'read'));

-- Update policies in scorecards table
DROP POLICY IF EXISTS "Enable insert for users with create_scorecards permission" ON "public"."scorecards";
CREATE POLICY "Enable insert for users with create_scorecards permission" ON "public"."scorecards"
FOR INSERT TO authenticated
WITH CHECK (
    public.user_has_permission((select auth.uid()), 'scorecards', 'create')
);

DROP POLICY IF EXISTS "Enable update for users with edit_scorecards permission on non-" ON "public"."scorecards";
DROP POLICY IF EXISTS "Enable update for users with edit_scorecards permission" ON "public"."scorecards";
CREATE POLICY "Enable update for users with edit_scorecards permission" ON "public"."scorecards"
FOR UPDATE TO authenticated
USING (public.user_has_permission((select auth.uid()), 'scorecards', 'read'))
WITH CHECK (
    (public.user_has_permission((select auth.uid()), 'scorecards', 'update') AND
    EXISTS (
        SELECT 1 FROM "public"."sessions" s
        WHERE s.id = "session_id"
        AND s.submitted_at IS NULL
    ))
);

DROP POLICY IF EXISTS "Enable delete for users with delete_scorecards permission on no" ON "public"."scorecards";
DROP POLICY IF EXISTS "Enable delete for users with delete_scorecards permission" ON "public"."scorecards";
CREATE POLICY "Enable delete for users with delete_scorecards permission" ON "public"."scorecards"
FOR DELETE TO authenticated
USING (
    public.user_has_permission((select auth.uid()), 'scorecards', 'delete')
);

DROP POLICY IF EXISTS "Enable read access for users with read permission" ON "public"."scorecards";
CREATE POLICY "Enable read access for users with read permission" ON "public"."scorecards"
FOR SELECT TO authenticated
USING (public.user_has_permission((select auth.uid()), 'scorecards', 'read'));

-- Update policies in rating_classes_to_tournaments table
DROP POLICY IF EXISTS "Enable insert for users with create_tournaments permission" ON "public"."rating_classes_to_tournaments";
CREATE POLICY "Enable insert for users with create_tournaments permission" ON "public"."rating_classes_to_tournaments"
FOR INSERT TO authenticated
WITH CHECK (
    public.user_has_permission((select auth.uid()), 'tournaments', 'create')
);

DROP POLICY IF EXISTS "Enable update for users with edit_tournaments permission" ON "public"."rating_classes_to_tournaments";
CREATE POLICY "Enable update for users with edit_tournaments permission" ON "public"."rating_classes_to_tournaments"
FOR UPDATE TO authenticated
USING (public.user_has_permission((select auth.uid()), 'tournaments', 'read'))
WITH CHECK (
    public.user_has_permission((select auth.uid()), 'tournaments', 'update')
);

DROP POLICY IF EXISTS "Enable delete for users with delete_tournaments permission" ON "public"."rating_classes_to_tournaments";
CREATE POLICY "Enable delete for users with delete_tournaments permission" ON "public"."rating_classes_to_tournaments"
FOR DELETE TO authenticated
USING (
    public.user_has_permission((select auth.uid()), 'tournaments', 'delete')
);

DROP POLICY IF EXISTS "Enable read access for users with read permission" ON "public"."rating_classes_to_tournaments";
CREATE POLICY "Enable read access for users with read permission" ON "public"."rating_classes_to_tournaments"
FOR SELECT TO authenticated
USING (public.user_has_permission((select auth.uid()), 'tournaments', 'read'));

-- Update policies in users table
DROP POLICY IF EXISTS "Users can update their own user data" ON "public"."users";
CREATE POLICY "Users can update their own user data" ON "public"."users"
FOR UPDATE TO authenticated
USING ((select auth.uid()) = id);

-- Fix realtime permissions
DROP POLICY IF EXISTS "Enable listening for scorecard changes" ON "realtime"."messages";
CREATE POLICY "Enable listening for scorecard changes" ON "realtime"."messages"
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (
        (("realtime"."messages".extension = 'postgres_changes'::text) AND (realtime.topic() = 'scorecard-changes'::text))
    );

DROP POLICY IF EXISTS "Enable listening for session changes" ON "realtime"."messages";
CREATE POLICY "Enable listening for session changes" ON "realtime"."messages"
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (
        (("realtime"."messages".extension = 'postgres_changes'::text) AND (realtime.topic() = 'tournament-session-changes'::text))
    );