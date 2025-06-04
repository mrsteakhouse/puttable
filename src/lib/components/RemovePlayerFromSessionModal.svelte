<script lang="ts">
    import { Alert, Button, Modal, Select } from 'flowbite-svelte';
    import { invalidateAll } from '$app/navigation';
    import type { SupabaseClient } from '@supabase/supabase-js';
    import type { Database } from '$lib/database.types';
    import { m } from "$lib/paraglide/messages";

    // Props
    let {
        open = $bindable(false),
        players = [],
        supabase
    }: {
        open: boolean,
        players: { id: number, playerId: number, playerName: string, scorecardId: number }[],
        supabase: SupabaseClient<Database>
    } = $props();

    // State
    let selectedPlayerId = $state<number | null>(null);
    let isSubmitting = $state(false);
    let error = $state('');

    // Reset state when modal opens
    $effect(() => {
        if (open) {
            selectedPlayerId = null;
            error = '';
        }
    });

    // Close the modal
    function closeModal() {
        open = false;
    }

    // Remove player from session
    async function removePlayerFromSession() {
        if (!selectedPlayerId) {
            error = m.remove_player_from_session_error_player();
            return;
        }

        isSubmitting = true;
        error = '';

        try {
            // Get the player's scorecard ID
            const playerToRemove = players.find(p => p.playerId === selectedPlayerId);
            if (!playerToRemove) {
                throw new Error(m.remove_player_from_session_error_not_found());
            }

            // Delete the scorecard
            const { error: deleteError } = await supabase
                .from('scorecards')
                .delete()
                .eq('id', playerToRemove.scorecardId);

            if (deleteError) throw new Error(deleteError.message);

            // Refresh the page data
            await invalidateAll();

            // Close the modal
            closeModal();
        } catch (e) {
            error = e instanceof Error ? e.message : m.remove_player_from_session_error_generic();
        } finally {
            isSubmitting = false;
        }
    }
</script>

<Modal title={m.remove_player_from_session_title()} bind:open={open} size="md" autoclose={false}>
    <div class="space-y-4">
        {#if error}
            <Alert color="red" class="mt-1">{error}</Alert>
        {/if}

        <div>
            <label for="player-select" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                {m.remove_player_from_session_select_player()}
            </label>
            <Select id="player-select" bind:value={selectedPlayerId} class="w-full" placeholder="">
                <option value={null} disabled selected>{m.remove_player_from_session_select_player_placeholder()}</option>
                {#each players as player}
                    <option value={player.playerId}>{player.playerName}</option>
                {/each}
            </Select>
        </div>

        <p class="text-sm text-red-500">
            {m.remove_player_from_session_warning()}
        </p>

        <div class="flex justify-end space-x-2 pt-4">
            <Button type="button" color="light" onclick={closeModal}>{m.remove_player_from_session_cancel()}</Button>
            <Button
                type="button"
                color="red"
                onclick={removePlayerFromSession}
                disabled={!selectedPlayerId || isSubmitting}
            >
                {isSubmitting ? m.remove_player_from_session_removing() : m.remove_player_from_session_remove()}
            </Button>
        </div>
    </div>
</Modal>
