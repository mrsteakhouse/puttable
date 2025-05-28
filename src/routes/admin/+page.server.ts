import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { session, supabase } }) => {
    // Redirect if not logged in
    if (!session) {
        throw redirect(303, '/');
    }

    // Check if user is admin
    const { data: roles } = await supabase.rpc('get_current_user_roles');
    const isAdmin = roles?.some((role: { role_name: string; }) => role.role_name === 'admin') || false;

    if (!isAdmin) {
        throw redirect(303, '/');
    }

    // Get users with roles
    const { data: users } = await supabase.rpc('list_users_with_roles');

    // Get roles with permissions
    const { data: rolesWithPermissions } = await supabase.rpc('list_roles_with_permissions');

    // Get all permissions
    const { data: permissions } = await supabase
        .from('permissions')
        .select('*')
        .order('resource', { ascending: true })
        .order('action', { ascending: true });

    return {
        users: users || [],
        roles: rolesWithPermissions || [],
        permissions: permissions || [],
        session
    };
};

export const actions: Actions = {
    assignRole: async ({ request, locals }) => {
        const { supabase } = locals;
        const formData = await request.formData();
        const userId = formData.get('userId')?.toString();
        const roleName = formData.get('roleName')?.toString();

        if (!userId || !roleName) {
            return { success: false, error: 'User ID and role name are required' };
        }

        const { error } = await supabase.rpc('assign_role_to_user', {
            p_user_id: userId,
            p_role_name: roleName
        });

        return { success: !error, error: error?.message };
    },

    removeRole: async ({ request, locals: { supabase } }) => {
        const formData = await request.formData();
        const userId = formData.get('userId')?.toString();
        const roleName = formData.get('roleName')?.toString();

        if (!userId || !roleName) {
            return { success: false, error: 'User ID and role name are required' };
        }

        const { error } = await supabase.rpc('remove_role_from_user', {
            p_user_id: userId,
            p_role_name: roleName
        });

        return { success: !error, error: error?.message };
    },

    createRole: async ({ request, locals }) => {
        const { supabase } = locals;
        const formData = await request.formData();
        const name = formData.get('name')?.toString();
        const description = formData.get('description')?.toString();

        if (!name) {
            return { success: false, error: 'Role name is required' };
        }

        const { error } = await supabase.rpc('create_role', {
            p_name: name,
            p_description: description || ''
        });

        return { success: !error, error: error?.message };
    },

    updateRole: async ({ request, locals }) => {
        const { supabase } = locals;
        const formData = await request.formData();
        const roleId = parseInt(formData.get('roleId')?.toString() || '0');
        const name = formData.get('name')?.toString();
        const description = formData.get('description')?.toString();

        if (!roleId || !name) {
            return { success: false, error: 'Role ID and name are required' };
        }

        const { error } = await supabase.rpc('update_role', {
            p_role_id: roleId,
            p_name: name,
            p_description: description || ''
        });

        return { success: !error, error: error?.message };
    },

    deleteRole: async ({ request, locals }) => {
        const { supabase } = locals;
        const formData = await request.formData();
        const roleId = parseInt(formData.get('roleId')?.toString() || '0');

        if (!roleId) {
            return { success: false, error: 'Role ID is required' };
        }

        const { error } = await supabase.rpc('delete_role', {
            p_role_id: roleId
        });

        return { success: !error, error: error?.message };
    },

    assignPermission: async ({ request, locals }) => {
        const { supabase } = locals;
        const formData = await request.formData();
        const roleId = parseInt(formData.get('roleId')?.toString() || '0');
        const permissionId = parseInt(formData.get('permissionId')?.toString() || '0');

        if (!roleId || !permissionId) {
            return { success: false, error: 'Role ID and permission ID are required' };
        }

        const { error } = await supabase.rpc('assign_permission_to_role', {
            p_role_id: roleId,
            p_permission_id: permissionId
        });

        return { success: !error, error: error?.message };
    },

    removePermission: async ({ request, locals }) => {
        const { supabase } = locals;
        const formData = await request.formData();
        const roleId = parseInt(formData.get('roleId')?.toString() || '0');
        const permissionId = parseInt(formData.get('permissionId')?.toString() || '0');

        if (!roleId || !permissionId) {
            return { success: false, error: 'Role ID and permission ID are required' };
        }

        const { error } = await supabase.rpc('remove_permission_from_role', {
            p_role_id: roleId,
            p_permission_id: permissionId
        });

        return { success: !error, error: error?.message };
    }
};