-- Migration to add functions for the admin user interface

-- Function to list all users with their roles
CREATE OR REPLACE FUNCTION public.list_users_with_roles()
RETURNS TABLE (
    user_id uuid,
    email text,
    user_name text,
    roles text[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.email,
        u.raw_user_meta_data->>'name' as user_name,
        array_agg(r.name) as roles
    FROM auth.users u
    LEFT JOIN public.user_roles ur ON u.id = ur.user_id
    LEFT JOIN public.roles r ON ur.role_id = r.id
    GROUP BY u.id, u.email, u.raw_user_meta_data->>'name';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users with admin role
REVOKE EXECUTE ON FUNCTION public.list_users_with_roles FROM anon;
REVOKE EXECUTE ON FUNCTION public.list_users_with_roles FROM authenticated;
GRANT EXECUTE ON FUNCTION public.list_users_with_roles TO service_role;

-- Create RLS policy for the function
CREATE POLICY "Allow admin to execute list_users_with_roles" ON public.roles
FOR SELECT TO authenticated
USING (
    public.user_has_permission(auth.uid(), '*', '*')
);

-- Function to list all roles with their permissions
CREATE OR REPLACE FUNCTION public.list_roles_with_permissions()
RETURNS TABLE (
    role_id bigint,
    role_name text,
    role_description text,
    permissions jsonb
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.name,
        r.description,
        jsonb_agg(
            jsonb_build_object(
                'id', p.id,
                'name', p.name,
                'resource', p.resource,
                'action', p.action,
                'description', p.description
            )
        ) as permissions
    FROM public.roles r
    LEFT JOIN public.role_permissions rp ON r.id = rp.role_id
    LEFT JOIN public.permissions p ON rp.permission_id = p.id
    GROUP BY r.id, r.name, r.description;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users with admin role
REVOKE EXECUTE ON FUNCTION public.list_roles_with_permissions FROM anon;
REVOKE EXECUTE ON FUNCTION public.list_roles_with_permissions FROM authenticated;
GRANT EXECUTE ON FUNCTION public.list_roles_with_permissions TO service_role;

-- Create RLS policy for the function
CREATE POLICY "Allow admin to execute list_roles_with_permissions" ON public.roles
FOR SELECT TO authenticated
USING (
    public.user_has_permission(auth.uid(), '*', '*')
);

-- Function to create a new role
CREATE OR REPLACE FUNCTION public.create_role(
    p_name text,
    p_description text
) RETURNS bigint AS $$
DECLARE
    v_role_id bigint;
BEGIN
    INSERT INTO public.roles (name, description)
    VALUES (p_name, p_description)
    RETURNING id INTO v_role_id;

    RETURN v_role_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service_role
REVOKE EXECUTE ON FUNCTION public.create_role FROM anon;
REVOKE EXECUTE ON FUNCTION public.create_role FROM authenticated;
GRANT EXECUTE ON FUNCTION public.create_role TO service_role;

-- Function to update a role
CREATE OR REPLACE FUNCTION public.update_role(
    p_role_id bigint,
    p_name text,
    p_description text
) RETURNS void AS $$
BEGIN
    UPDATE public.roles
    SET name = p_name,
        description = p_description
    WHERE id = p_role_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service_role
REVOKE EXECUTE ON FUNCTION public.update_role FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_role FROM authenticated;
GRANT EXECUTE ON FUNCTION public.update_role TO service_role;

-- Function to delete a role
CREATE OR REPLACE FUNCTION public.delete_role(
    p_role_id bigint
) RETURNS void AS $$
BEGIN
    DELETE FROM public.roles
    WHERE id = p_role_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service_role
REVOKE EXECUTE ON FUNCTION public.delete_role FROM anon;
REVOKE EXECUTE ON FUNCTION public.delete_role FROM authenticated;
GRANT EXECUTE ON FUNCTION public.delete_role TO service_role;

-- Function to assign a permission to a role
CREATE OR REPLACE FUNCTION public.assign_permission_to_role(
    p_role_id bigint,
    p_permission_id bigint
) RETURNS void AS $$
BEGIN
    INSERT INTO public.role_permissions (role_id, permission_id)
    VALUES (p_role_id, p_permission_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service_role
REVOKE EXECUTE ON FUNCTION public.assign_permission_to_role FROM anon;
REVOKE EXECUTE ON FUNCTION public.assign_permission_to_role FROM authenticated;
GRANT EXECUTE ON FUNCTION public.assign_permission_to_role TO service_role;

-- Function to remove a permission from a role
CREATE OR REPLACE FUNCTION public.remove_permission_from_role(
    p_role_id bigint,
    p_permission_id bigint
) RETURNS void AS $$
BEGIN
    DELETE FROM public.role_permissions
    WHERE role_id = p_role_id AND permission_id = p_permission_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service_role
REVOKE EXECUTE ON FUNCTION public.remove_permission_from_role FROM anon;
REVOKE EXECUTE ON FUNCTION public.remove_permission_from_role FROM authenticated;
GRANT EXECUTE ON FUNCTION public.remove_permission_from_role TO service_role;

-- Create a secure RPC endpoint for checking if the current user has a specific permission
CREATE OR REPLACE FUNCTION public.current_user_has_permission(
    resource text,
    action text
) RETURNS boolean AS $$
BEGIN
    RETURN public.user_has_permission(auth.uid(), resource, action);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.current_user_has_permission TO authenticated;

-- Create a function to get all permissions for the current user
CREATE OR REPLACE FUNCTION public.get_current_user_permissions()
RETURNS TABLE (
    permission_name text,
    resource text,
    action text
) AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.get_user_permissions(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_current_user_permissions TO authenticated;

-- Create a function to get all roles for the current user
CREATE OR REPLACE FUNCTION public.get_current_user_roles()
RETURNS TABLE (
    role_id bigint,
    role_name text,
    role_description text
) AS $$
BEGIN
    RETURN QUERY
    SELECT r.id, r.name, r.description
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_current_user_roles TO authenticated;