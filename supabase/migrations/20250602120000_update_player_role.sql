-- Migration to update sessions policies and player role permissions

-- Update player role permissions: remove edit_sessions, keep submit_sessions
DELETE FROM public.role_permissions
WHERE role_id = (SELECT id FROM public.roles WHERE name = 'player')
AND permission_id = (SELECT id FROM public.permissions WHERE resource = 'sessions' AND action = 'update');

-- Ensure player role has submit_sessions permission
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
    (SELECT id FROM public.roles WHERE name = 'player'),
    (SELECT id FROM public.permissions WHERE resource = 'sessions' AND action = 'submit')
WHERE NOT EXISTS (
    SELECT 1 FROM public.role_permissions
    WHERE role_id = (SELECT id FROM public.roles WHERE name = 'player')
    AND permission_id = (SELECT id FROM public.permissions WHERE resource = 'sessions' AND action = 'submit')
);