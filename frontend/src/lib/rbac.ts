import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * Check if the current user has a specific permission
 * @param supabase The Supabase client
 * @param resource The resource to check permission for
 * @param action The action to check permission for
 * @returns A promise that resolves to a boolean indicating if the user has the permission
 */
export async function hasPermission(supabase: SupabaseClient<Database>, resource: string, action: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('current_user_has_permission', {
    resource: resource,
    action: action
  });

  if (error) {
    console.error('Error checking permission:', error);
    return false;
  }

  return data || false;
}

/**
 * Get all permissions for the current user
 * @param supabase The Supabase client
 * @returns A promise that resolves to an array of permissions
 */
export async function getCurrentUserPermissions(supabase: any): Promise<{ permission_name: string; resource: string; action: string }[]> {
  const { data, error } = await supabase.rpc('get_current_user_permissions');

  if (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all roles for the current user
 * @param supabase The Supabase client
 * @returns A promise that resolves to an array of roles
 */
export async function getCurrentUserRoles(supabase: any): Promise<{ role_id: number; role_name: string; role_description: string }[]> {
  const { data, error } = await supabase.rpc('get_current_user_roles');

  if (error) {
    console.error('Error getting user roles:', error);
    return [];
  }

  return data || [];
}

/**
 * Check if the current user is an admin
 * @param supabase The Supabase client
 * @returns A promise that resolves to a boolean indicating if the user is an admin
 */
export async function isAdmin(supabase: any): Promise<boolean> {
  const roles = await getCurrentUserRoles(supabase);
  return roles.some(role => role.role_name === 'admin');
}

/**
 * Check if the current user is a manager
 * @param supabase The Supabase client
 * @returns A promise that resolves to a boolean indicating if the user is a manager
 */
export async function isManager(supabase: any): Promise<boolean> {
  const roles = await getCurrentUserRoles(supabase);
  return roles.some(role => role.role_name === 'manager' || role.role_name === 'admin');
}

/**
 * Check if the current user can access a specific resource
 * @param supabase The Supabase client
 * @param resourceTable The resource table name
 * @param resourceId The resource ID
 * @param action The action to check
 * @returns A promise that resolves to a boolean indicating if the user can access the resource
 */
export async function canAccessResource(supabase: any, resourceTable: string, resourceId: number, action: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('can_access_resource', {
    resource_table: resourceTable,
    resource_id: resourceId,
    action: action
  });

  if (error) {
    console.error('Error checking resource access:', error);
    return false;
  }

  return data || false;
}

/**
 * Check if the current user is the owner of a resource
 * @param supabase The Supabase client
 * @param resourceTable The resource table name
 * @param resourceId The resource ID
 * @returns A promise that resolves to a boolean indicating if the user is the owner
 */
export async function isOwner(supabase: any, resourceTable: string, resourceId: number): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_owner', {
    resource_table: resourceTable,
    resource_id: resourceId
  });

  if (error) {
    console.error('Error checking ownership:', error);
    return false;
  }

  return data || false;
}
