-- First, drop the existing update policies for sessions
DROP POLICY IF EXISTS "Enable update for users with sessions permissions" ON "public"."sessions";

-- Create a new RLS policy with a correct using statement
CREATE POLICY "Enable update for users with sessions permissions" ON "public"."sessions"
FOR UPDATE TO authenticated
               USING (public.user_has_permission((select auth.uid()), 'sessions', 'update') OR (submitted_at IS NULL))
    WITH CHECK (
               public.user_has_permission((select auth.uid()), 'sessions', 'submit'));
