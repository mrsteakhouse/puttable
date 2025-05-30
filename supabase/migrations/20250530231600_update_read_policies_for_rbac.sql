-- Migration to update Row Level Security read policies to use RBAC permissions

-- Update tournament table read policy
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."tournaments";
CREATE POLICY "Enable read access for users with read permission" ON "public"."tournaments"
FOR SELECT TO authenticated
USING (public.user_has_permission(auth.uid(), 'tournaments', 'read'));

-- Update sessions table read policy
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."sessions";
CREATE POLICY "Enable read access for users with read permission" ON "public"."sessions"
FOR SELECT TO authenticated
USING (public.user_has_permission(auth.uid(), 'sessions', 'read'));

-- Update players table read policy
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."players";
CREATE POLICY "Enable read access for users with read permission" ON "public"."players"
FOR SELECT TO authenticated
USING (public.user_has_permission(auth.uid(), 'players', 'read'));

-- Update rating_classes table read policy
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."rating_classes";
CREATE POLICY "Enable read access for users with read permission" ON "public"."rating_classes"
FOR SELECT TO authenticated
USING (public.user_has_permission(auth.uid(), 'rating_classes', 'read'));

-- Update scorecards table read policy
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."scorecards";
CREATE POLICY "Enable read access for users with read permission" ON "public"."scorecards"
FOR SELECT TO authenticated
USING (public.user_has_permission(auth.uid(), 'scorecards', 'read'));

-- Update rating_classes_to_tournaments table read policy
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."rating_classes_to_tournaments";
CREATE POLICY "Enable read access for users with read permission" ON "public"."rating_classes_to_tournaments"
FOR SELECT TO authenticated
USING (public.user_has_permission(auth.uid(), 'tournaments', 'read'));