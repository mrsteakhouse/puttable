-- Migration to update all functions to always specify the schema

-- Update is_owner function
CREATE OR REPLACE FUNCTION public.is_owner(
    resource_table text,
    resource_id bigint
) RETURNS boolean
    SET search_path = ''
    AS $$
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

-- Update can_access_resource function
CREATE OR REPLACE FUNCTION public.can_access_resource(
    resource_table text,
    resource_id bigint,
    action text
) RETURNS boolean
    SET search_path = ''
    AS $$
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

-- Update list_users_with_roles function
CREATE OR REPLACE FUNCTION public.list_users_with_roles()
RETURNS TABLE (
    user_id uuid,
    email text,
    user_name text,
    roles text[]
)
    SET search_path = ''
    AS $$
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

-- Update list_roles_with_permissions function
CREATE OR REPLACE FUNCTION public.list_roles_with_permissions()
RETURNS TABLE (
    role_id bigint,
    role_name text,
    role_description text,
    permissions jsonb
) SET search_path = '' AS $$
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

-- Update create_role function
CREATE OR REPLACE FUNCTION public.create_role(
    p_name text,
    p_description text
) RETURNS bigint SET search_path = '' AS $$
DECLARE
    v_role_id bigint;
BEGIN
    INSERT INTO public.roles (name, description)
    VALUES (p_name, p_description)
    RETURNING id INTO v_role_id;

    RETURN v_role_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update update_role function
CREATE OR REPLACE FUNCTION public.update_role(
    p_role_id bigint,
    p_name text,
    p_description text
) RETURNS void SET search_path = '' AS $$
BEGIN
    UPDATE public.roles
    SET name = p_name,
        description = p_description
    WHERE id = p_role_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update delete_role function
CREATE OR REPLACE FUNCTION public.delete_role(
    p_role_id bigint
) RETURNS void SET search_path = '' AS $$
BEGIN
    DELETE FROM public.roles
    WHERE id = p_role_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update assign_permission_to_role function
CREATE OR REPLACE FUNCTION public.assign_permission_to_role(
    p_role_id bigint,
    p_permission_id bigint
) RETURNS void SET search_path = '' AS $$
BEGIN
    INSERT INTO public.role_permissions (role_id, permission_id)
    VALUES (p_role_id, p_permission_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update remove_permission_from_role function
CREATE OR REPLACE FUNCTION public.remove_permission_from_role(
    p_role_id bigint,
    p_permission_id bigint
) RETURNS void SET search_path = '' AS $$
BEGIN
    DELETE FROM public.role_permissions
    WHERE role_id = p_role_id AND permission_id = p_permission_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update current_user_has_permission function
CREATE OR REPLACE FUNCTION public.current_user_has_permission(
    resource text,
    action text
) RETURNS boolean SET search_path = '' AS $$
BEGIN
    RETURN public.user_has_permission(auth.uid(), resource, action);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update get_current_user_permissions function
CREATE OR REPLACE FUNCTION public.get_current_user_permissions()
RETURNS TABLE (
    permission_name text,
    resource text,
    action text
) SET search_path = '' AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.get_user_permissions(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update get_current_user_roles function
CREATE OR REPLACE FUNCTION public.get_current_user_roles()
RETURNS TABLE (
    role_id bigint,
    role_name text,
    role_description text
) SET search_path = '' AS $$
BEGIN
    RETURN QUERY
    SELECT r.id, r.name, r.description
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update assign_default_role function
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER SET search_path = '' AS $$
BEGIN
    -- Assign the 'player' role to the new user
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (NEW.id, (SELECT id FROM public.roles WHERE name = 'player'));

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update assign_role_to_user function
CREATE OR REPLACE FUNCTION public.assign_role_to_user(
    p_user_id uuid,
    p_role_name text
) RETURNS void SET search_path = '' AS $$
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

-- Update remove_role_from_user function
CREATE OR REPLACE FUNCTION public.remove_role_from_user(
    p_user_id uuid,
    p_role_name text
) RETURNS void SET search_path = '' AS $$
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

-- Update user_has_permission function
CREATE OR REPLACE FUNCTION public.user_has_permission(
    user_id uuid,
    resource text,
    action text
) RETURNS boolean SET search_path = '' AS $$
DECLARE
    has_permission boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = user_has_permission.user_id
        AND ((p.resource = user_has_permission.resource
        AND p.action = user_has_permission.action)
        OR (p.resource = '*' AND p.action = '*'))
    ) INTO has_permission;

    RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update get_user_permissions function
CREATE OR REPLACE FUNCTION public.get_user_permissions(
    user_id uuid
) RETURNS TABLE (
    permission_name text,
    resource text,
    action text
) SET search_path = '' AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT p.name, p.resource, p.action
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = get_user_permissions.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update update_jsonb_array_element function
CREATE OR REPLACE FUNCTION public.update_jsonb_array_element(
  record_id bigint,
  array_index int,
  new_value jsonb
) RETURNS void SET search_path = '' AS $$
BEGIN
  -- Only update if the associated session has not been submitted and user has permission
  UPDATE public.scorecards sc
  SET data = jsonb_set(data, ('{' || array_index || '}')::text[], new_value::jsonb, true)
  FROM public.sessions s
  WHERE sc.id = record_id
    AND sc.session_id = s.id
    AND s.submitted_at IS NULL
    AND public.user_has_permission(auth.uid(), 'scorecards', 'update');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.ensure_admin_exists()
    RETURNS void SET search_path = '' AS $$
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

-- Create trigger to automatically create a user record when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger SET search_path = '' AS $$
BEGIN
    INSERT INTO public.users (id, email, display_name)
    VALUES (
               NEW.id,
               NEW.email,
               COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
           );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;