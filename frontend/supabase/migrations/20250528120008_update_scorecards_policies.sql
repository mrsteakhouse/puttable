-- Migration to update scorecards policies to not rely on session ownership

-- Drop the policies that depend on session ownership
DROP POLICY IF EXISTS "Enable update for session owners" ON "public"."scorecards";
DROP POLICY IF EXISTS "Enable delete for session owners" ON "public"."scorecards";

-- Create new policies that only check if the session is not submitted
-- and if the user has the appropriate permissions
CREATE POLICY "Enable update for users with edit_scorecards permission on non-submitted sessions"
ON "public"."scorecards"
FOR UPDATE TO authenticated
WITH CHECK (
    public.user_has_permission(auth.uid(), 'scorecards', 'update') AND
    EXISTS (
        SELECT 1 FROM "public"."sessions" s
        WHERE s.id = "session_id"
        AND s.submitted_at IS NULL
    )
);

CREATE POLICY "Enable delete for users with delete_scorecards permission on non-submitted sessions"
ON "public"."scorecards"
FOR DELETE TO authenticated
USING (
    public.user_has_permission(auth.uid(), 'scorecards', 'delete') AND
    EXISTS (
        SELECT 1 FROM "public"."sessions" s
        WHERE s.id = "session_id"
        AND s.submitted_at IS NULL
    )
);