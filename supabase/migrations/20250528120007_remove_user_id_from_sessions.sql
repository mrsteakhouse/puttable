-- Migration to remove user_id from sessions table

-- First, update any RLS policies that depend on user_id
DROP POLICY IF EXISTS "Enable update for session owners" ON "public"."sessions";
DROP POLICY IF EXISTS "Enable delete for session owners" ON "public"."sessions";
DROP POLICY IF EXISTS "Enable update for session owners" ON "public"."sessions";
DROP POLICY IF EXISTS "Enable delete for session owners" ON "public"."scorecards";
DROP POLICY IF EXISTS "Enable update for session owners" ON "public"."scorecards";

-- Update the is_owner function to not rely on user_id
CREATE OR REPLACE FUNCTION public.is_owner(
    resource_table text,
    resource_id bigint
) RETURNS boolean AS $$
DECLARE
    is_owner boolean;
BEGIN
    -- Since we're removing user_id from sessions, ownership will now be determined differently
    -- For example, through scorecards or other relationships
    -- For now, we'll return false for sessions since there's no direct ownership
    is_owner := false;

    RETURN is_owner;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now remove the user_id column from the sessions table
ALTER TABLE "public"."sessions" DROP COLUMN IF EXISTS "user_id";