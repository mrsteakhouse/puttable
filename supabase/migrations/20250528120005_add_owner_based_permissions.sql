-- Migration to add owner-based permissions

-- Update sessions table policies to allow owners to manage their own sessions
CREATE POLICY "Enable update for session owners" ON "public"."sessions"
FOR UPDATE TO authenticated
WITH CHECK (
    auth.uid() = user_id AND submitted_at IS NULL
);

CREATE POLICY "Enable delete for session owners" ON "public"."sessions"
FOR DELETE TO authenticated
USING (
    auth.uid() = user_id AND submitted_at IS NULL
);

-- Update scorecards table policies to allow session owners to manage scorecards
CREATE POLICY "Enable update for session owners" ON "public"."scorecards"
FOR UPDATE TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM "public"."sessions" s
        WHERE s.id = "session_id"
        AND s.user_id = auth.uid()
        AND s.submitted_at IS NULL
    )
);

CREATE POLICY "Enable delete for session owners" ON "public"."scorecards"
FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "public"."sessions" s
        WHERE s.id = "session_id"
        AND s.user_id = auth.uid()
        AND s.submitted_at IS NULL
    )
);

-- Create a function to check if a user is the owner of a resource
CREATE OR REPLACE FUNCTION public.is_owner(
    resource_table text,
    resource_id bigint
) RETURNS boolean AS $$
DECLARE
    is_owner boolean;
BEGIN
    IF resource_table = 'sessions' THEN
        SELECT EXISTS (
            SELECT 1 FROM public.sessions
            WHERE id = resource_id AND user_id = auth.uid()
        ) INTO is_owner;
    ELSIF resource_table = 'tournaments' THEN
        -- For now, tournaments don't have an owner field
        -- This could be extended in the future
        is_owner := false;
    ELSE
        is_owner := false;
    END IF;

    RETURN is_owner;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to all users
GRANT EXECUTE ON FUNCTION public.is_owner TO anon;
GRANT EXECUTE ON FUNCTION public.is_owner TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_owner TO service_role;

-- Create a function to check if a user can perform an action on a resource
-- This combines role-based permissions and ownership-based permissions
CREATE OR REPLACE FUNCTION public.can_access_resource(
    resource_table text,
    resource_id bigint,
    action text
) RETURNS boolean AS $$
DECLARE
    has_permission boolean;
BEGIN
    -- Check if user has permission through roles
    SELECT public.user_has_permission(auth.uid(), resource_table, action) INTO has_permission;

    -- If user doesn't have role-based permission, check if they're the owner
    IF NOT has_permission AND (action = 'update' OR action = 'delete') THEN
        has_permission := public.is_owner(resource_table, resource_id);
    END IF;

    RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to all users
GRANT EXECUTE ON FUNCTION public.can_access_resource TO anon;
GRANT EXECUTE ON FUNCTION public.can_access_resource TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_resource TO service_role;