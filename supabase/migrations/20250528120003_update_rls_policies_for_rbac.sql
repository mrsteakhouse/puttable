-- Migration to update Row Level Security policies to use RBAC permissions

-- Update tournament table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."tournaments";
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."tournaments";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."tournaments";
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON "public"."tournaments";

CREATE POLICY "Enable read access for all users" ON "public"."tournaments"
FOR SELECT USING (true);

CREATE POLICY "Enable insert for users with create_tournaments permission" ON "public"."tournaments"
FOR INSERT TO authenticated
WITH CHECK (
    public.user_has_permission(auth.uid(), 'tournaments', 'create')
);

CREATE POLICY "Enable update for users with edit_tournaments permission" ON "public"."tournaments"
FOR UPDATE TO authenticated
USING (public.user_has_permission(auth.uid(), 'tournaments', 'read'))
WITH CHECK (
    public.user_has_permission(auth.uid(), 'tournaments', 'update')
);

CREATE POLICY "Enable delete for users with delete_tournaments permission" ON "public"."tournaments"
FOR DELETE TO authenticated
USING (
    public.user_has_permission(auth.uid(), 'tournaments', 'delete')
);

-- Update sessions table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."sessions";
DROP POLICY IF EXISTS "Enable insert for all users" ON "public"."sessions";
DROP POLICY IF EXISTS "Enable update for all users" ON "public"."sessions";

CREATE POLICY "Enable read access for all users" ON "public"."sessions"
FOR SELECT USING (true);

CREATE POLICY "Enable insert for users with create_sessions permission" ON "public"."sessions"
FOR INSERT TO authenticated
WITH CHECK (
    public.user_has_permission(auth.uid(), 'sessions', 'create')
);

CREATE POLICY "Enable update for users with edit_sessions permission" ON "public"."sessions"
FOR UPDATE TO authenticated
USING (public.user_has_permission(auth.uid(), 'sessions', 'read'))
WITH CHECK (
    public.user_has_permission(auth.uid(), 'sessions', 'update') AND
    (submitted_at IS NULL OR public.user_has_permission(auth.uid(), 'sessions', 'submit'))
);

CREATE POLICY "Enable delete for users with delete_sessions permission" ON "public"."sessions"
FOR DELETE TO authenticated
USING (
    public.user_has_permission(auth.uid(), 'sessions', 'delete')
);

-- Update players table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."players";
DROP POLICY IF EXISTS "Enable all users to insert" ON "public"."players";

CREATE POLICY "Enable read access for all users" ON "public"."players"
FOR SELECT USING (true);

CREATE POLICY "Enable insert for users with create_players permission" ON "public"."players"
FOR INSERT TO authenticated
WITH CHECK (
    public.user_has_permission(auth.uid(), 'players', 'create')
);

CREATE POLICY "Enable update for users with edit_players permission" ON "public"."players"
FOR UPDATE TO authenticated
USING (public.user_has_permission(auth.uid(), 'players', 'read'))
WITH CHECK (
    public.user_has_permission(auth.uid(), 'players', 'update')
);

CREATE POLICY "Enable delete for users with delete_players permission" ON "public"."players"
FOR DELETE TO authenticated
USING (
    public.user_has_permission(auth.uid(), 'players', 'delete')
);

-- Update rating_classes table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."rating_classes";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."rating_classes";

CREATE POLICY "Enable read access for all users" ON "public"."rating_classes"
FOR SELECT USING (true);

CREATE POLICY "Enable insert for users with create_rating_classes permission" ON "public"."rating_classes"
FOR INSERT TO authenticated
WITH CHECK (
    public.user_has_permission(auth.uid(), 'rating_classes', 'create')
);

CREATE POLICY "Enable update for users with edit_rating_classes permission" ON "public"."rating_classes"
FOR UPDATE TO authenticated
USING (public.user_has_permission(auth.uid(), 'rating_classes', 'read'))
WITH CHECK (
    public.user_has_permission(auth.uid(), 'rating_classes', 'update')
);

CREATE POLICY "Enable delete for users with delete_rating_classes permission" ON "public"."rating_classes"
FOR DELETE TO authenticated
USING (
    public.user_has_permission(auth.uid(), 'rating_classes', 'delete')
);

-- Update scorecards table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."scorecards";
DROP POLICY IF EXISTS "Enable insert for all users" ON "public"."scorecards";
DROP POLICY IF EXISTS "Enable update for all users" ON "public"."scorecards";

CREATE POLICY "Enable read access for all users" ON "public"."scorecards"
FOR SELECT USING (true);

CREATE POLICY "Enable insert for users with create_scorecards permission" ON "public"."scorecards"
FOR INSERT TO authenticated
WITH CHECK (
    public.user_has_permission(auth.uid(), 'scorecards', 'create')
);

CREATE POLICY "Enable update for users with edit_scorecards permission" ON "public"."scorecards"
FOR UPDATE TO authenticated
USING (public.user_has_permission(auth.uid(), 'scorecards', 'read'))
WITH CHECK (
    public.user_has_permission(auth.uid(), 'scorecards', 'update') AND
    EXISTS (
        SELECT 1 FROM "public"."sessions" s
        WHERE s.id = "session_id"
        AND s.submitted_at IS NULL
    )
);

CREATE POLICY "Enable delete for users with delete_scorecards permission" ON "public"."scorecards"
FOR DELETE TO authenticated
USING (
    public.user_has_permission(auth.uid(), 'scorecards', 'delete')
);

-- Update rating_classes_to_tournaments table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."rating_classes_to_tournaments";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."rating_classes_to_tournaments";
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON "public"."rating_classes_to_tournaments";

CREATE POLICY "Enable read access for all users" ON "public"."rating_classes_to_tournaments"
FOR SELECT USING (true);

CREATE POLICY "Enable insert for users with create_tournaments permission" ON "public"."rating_classes_to_tournaments"
FOR INSERT TO authenticated
WITH CHECK (
    public.user_has_permission(auth.uid(), 'tournaments', 'create')
);

CREATE POLICY "Enable update for users with edit_tournaments permission" ON "public"."rating_classes_to_tournaments"
FOR UPDATE TO authenticated
USING (public.user_has_permission(auth.uid(), 'tournaments', 'read'))
WITH CHECK (
    public.user_has_permission(auth.uid(), 'tournaments', 'update')
);

CREATE POLICY "Enable delete for users with delete_tournaments permission" ON "public"."rating_classes_to_tournaments"
FOR DELETE TO authenticated
USING (
    public.user_has_permission(auth.uid(), 'tournaments', 'delete')
);

-- Update the update_jsonb_array_element function to check for edit_scorecards permission
CREATE OR REPLACE FUNCTION update_jsonb_array_element(
  record_id bigint,
  array_index int,
  new_value jsonb
) RETURNS void AS $$
BEGIN
  -- Only update if the associated session has not been submitted and user has permission
  UPDATE scorecards sc
  SET data = jsonb_set(data, ('{' || array_index || '}')::text[], new_value::jsonb, true)
  FROM sessions s
  WHERE sc.id = record_id
    AND sc.session_id = s.id
    AND s.submitted_at IS NULL
    AND public.user_has_permission(auth.uid(), 'scorecards', 'update');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;