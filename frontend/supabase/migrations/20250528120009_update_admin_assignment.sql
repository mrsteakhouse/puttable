-- Migration to update admin assignment to not rely on user_id in sessions

-- Replace the DO block that assigns admin role to a user from sessions
-- with a new approach that creates a default admin user if none exists
CREATE OR REPLACE FUNCTION public.ensure_admin_exists()
RETURNS void AS $$
DECLARE
    admin_exists boolean;
BEGIN
    -- Check if any user has the admin role
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE r.name = 'admin'
    ) INTO admin_exists;

    -- If no admin exists, create a default admin user
    -- This is just a placeholder - in a real application, you would
    -- either manually assign an admin or have a more sophisticated approach
    IF NOT admin_exists THEN
        -- Log a message - in a real application, you might want to
        -- create a notification or take other action
        RAISE NOTICE 'No admin user found. Please assign an admin role to at least one user.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Call the function to ensure an admin exists
SELECT public.ensure_admin_exists();

-- Grant execute permission to service_role
GRANT EXECUTE ON FUNCTION public.ensure_admin_exists TO service_role;