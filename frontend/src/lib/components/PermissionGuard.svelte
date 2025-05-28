<script lang="ts">
    import { onMount, type Snippet } from 'svelte';
    import { hasPermission, isAdmin } from '$lib/rbac';
    import type { SupabaseClient } from '@supabase/supabase-js';
    import type { Database } from '$lib/database.types';
    import { Action, Resource } from '$lib/permissions';

    let {
        supabase,
        resource,
        action,
        children,
        allowAdmin = true,
        showWhileLoading = false
    }: {
        supabase: SupabaseClient<Database>,
        resource: Resource,
        action: Action,
        children: Snippet
        allowAdmin?: boolean,
        showWhileLoading?: boolean
    } = $props();

    let loading = $state(true);
    let allowed = $state(false);

    onMount(async () => {
        try {
            if (allowAdmin) {
                const adminStatus = await isAdmin(supabase);
                if (adminStatus) {
                    allowed = true;
                    loading = false;
                    return;
                }
            }

            allowed = await hasPermission(supabase, resource, action);
        } catch (error) {
            console.error('Error checking permission:', error);
            allowed = false;
        } finally {
            loading = false;
        }
    });
</script>

{#if (loading && showWhileLoading) || allowed}
    {@render children?.()}
{:else if loading}
    <!-- Optional loading indicator -->
{/if}