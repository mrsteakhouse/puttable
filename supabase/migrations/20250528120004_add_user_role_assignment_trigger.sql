-- Migration to add a trigger for automatically assigning roles to new users

-- Create a function to assign the default 'player' role to new users
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Assign the 'player' role to the new user
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (NEW.id, (SELECT id FROM public.roles WHERE name = 'player'));

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a new user is created
CREATE TRIGGER assign_default_role_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.assign_default_role();

-- Grant execute permission to service_role
GRANT EXECUTE ON FUNCTION public.assign_default_role TO service_role;

-- Add a function to assign a specific role to a user (for admin use)
CREATE OR REPLACE FUNCTION public.assign_role_to_user(
    p_user_id uuid,
    p_role_name text
) RETURNS void AS $$
DECLARE
    v_role_id bigint;
BEGIN
    -- Get the role ID
    SELECT id INTO v_role_id FROM public.roles WHERE name = p_role_name;

    IF v_role_id IS NULL THEN
        RAISE EXCEPTION 'Role % not found', p_role_name;
    END IF;

    -- Insert the user role if it doesn't exist
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (p_user_id, v_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service_role
GRANT EXECUTE ON FUNCTION public.assign_role_to_user TO service_role;

-- Add a function to remove a role from a user
CREATE OR REPLACE FUNCTION public.remove_role_from_user(
    p_user_id uuid,
    p_role_name text
) RETURNS void AS $$
DECLARE
    v_role_id bigint;
BEGIN
    -- Get the role ID
    SELECT id INTO v_role_id FROM public.roles WHERE name = p_role_name;

    IF v_role_id IS NULL THEN
        RAISE EXCEPTION 'Role % not found', p_role_name;
    END IF;

    -- Delete the user role
    DELETE FROM public.user_roles
    WHERE user_id = p_user_id AND role_id = v_role_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service_role
GRANT EXECUTE ON FUNCTION public.remove_role_from_user TO service_role;

-- Assign admin role to existing users in the seed data
DO $$
DECLARE
    user_id uuid;
BEGIN
    -- Get the first user from the sessions table
    SELECT DISTINCT s.user_id INTO user_id FROM public.sessions s LIMIT 1;

    -- If a user exists, assign the admin role
    IF user_id IS NOT NULL THEN
        PERFORM public.assign_role_to_user(user_id, 'admin');
    END IF;
END;
$$ LANGUAGE plpgsql;