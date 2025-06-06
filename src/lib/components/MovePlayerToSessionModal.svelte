<script lang="ts">
    import { Alert, Button, Modal, Select } from 'flowbite-svelte';
    import { invalidateAll } from '$app/navigation';
    import type { SupabaseClient } from '@supabase/supabase-js';
    import type { Database } from '$lib/database.types';
    import { m } from "$lib/paraglide/messages";

    // Props
    let {
        open = $bindable(false),
        currentSessionId,
        players = [],
        supabase
    }: {
        open: boolean,
        currentSessionId: number,
        players: { id: number, playerId: number, playerName: string, scorecardId: number }[],
        supabase: SupabaseClient<Database>
    } = $props();

    // State
    let selectedPlayerId = $state<number | null>(null);
    let selectedSessionId = $state<number | null>(null);
    let availableSessions = $state<{ id: number, name: string }[]>([]);
    let isSubmitting = $state(false);
    let error = $state('');
    let isLoading = $state(false);

    // Reset state when modal opens
    $effect(() => {
        if (open) {
            selectedPlayerId = null;
            selectedSessionId = null;
            error = '';
            loadAvailableSessions();
        }
    });

    // Load available sessions (excluding the current one)
    async function loadAvailableSessions() {
        isLoading = true;
        error = '';

        try {
            const { data, error: sessionsError } = await supabase
                .from('sessions')
                .select('id, tournament:tournaments(name)')
                .neq('id', currentSessionId);

            if (sessionsError) throw new Error(sessionsError.message);

            availableSessions = data.map(session => ({
                id: session.id,
                name: session.tournament ? session.tournament.name : m.move_player_to_session_free_play()
            }));
        } catch (e) {
            error = e instanceof Error ? e.message : m.move_player_to_session_error_loading();
        } finally {
            isLoading = false;
        }
    }

    // Close the modal
    function closeModal() {
        open = false;
    }

    // Move player to another session
    async function movePlayerToSession() {
        if (!selectedPlayerId) {
            error = m.move_player_to_session_error_player();
            return;
        }

        if (!selectedSessionId) {
            error = m.move_player_to_session_error_session();
            return;
        }

        isSubmitting = true;
        error = '';

        try {
            // Get the player's scorecard ID
            const playerToMove = players.find(p => p.playerId === selectedPlayerId);
            if (!playerToMove) {
                throw new Error(m.move_player_to_session_error_not_found());
            }

            // Get the number of holes in the target session
            const { data: sessionData, error: sessionError } = await supabase
                .from('sessions')
                .select('id, tournament:tournaments(number_of_holes), scorecards(data)')
                .eq('id', selectedSessionId)
                .single()
                .overrideTypes<{ scorecards: { data: number[] }[] }>();

            if (sessionError) throw new Error(sessionError.message);

            // Determine the number of holes in the target session
            const holes = sessionData.tournament
                ? sessionData.tournament.number_of_holes
                : (sessionData.scorecards.length > 0 ? sessionData.scorecards[0].data?.length : 18);

            // Create a new scorecard in the target session
            const { error: insertError } = await supabase
                .from('scorecards')
                .insert({
                    session_id: selectedSessionId,
                    player_id: selectedPlayerId,
                    data: Array(holes).fill(0)
                });

            if (insertError) throw new Error(insertError.message);

            // Delete the scorecard from the current session
            const { error: deleteError } = await supabase
                .from('scorecards')
                .delete()
                .eq('id', playerToMove.scorecardId);

            if (deleteError) throw new Error(deleteError.message);

            // Refresh the page data
            await invalidateAll();

            // Close the modal
            closeModal();
        } catch (e) {
            error = e instanceof Error ? e.message : m.move_player_to_session_error_generic();
        } finally {
            isSubmitting = false;
        }
    }
</script>

<Modal title={m.move_player_to_session_title()} bind:open={open} size="md" autoclose={false}>
    <div class="space-y-4">
        {#if error}
            <Alert color="red" class="mt-1">{error}</Alert>
        {/if}

        <div>
            <label for="player-select" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                {m.move_player_to_session_select_player()}
            </label>
            <Select id="player-select" bind:value={selectedPlayerId} class="w-full">
                <option value={null} disabled selected>{m.move_player_to_session_select_player_placeholder()}</option>
                {#each players as player}
                    <option value={player.playerId}>{player.playerName}</option>
                {/each}
            </Select>
        </div>

        <div>
            <label for="session-select" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                {m.move_player_to_session_select_session()}
            </label>
            {#if isLoading}
                <p class="text-sm text-gray-500">{m.move_player_to_session_loading()}</p>
            {:else if availableSessions.length === 0}
                <p class="text-sm text-gray-500">{m.move_player_to_session_no_sessions()}</p>
            {:else}
                <Select id="session-select" bind:value={selectedSessionId} class="w-full" placeholder="">
                    <option value={null} disabled selected>{m.move_player_to_session_select_session_placeholder()}</option>
                    {#each availableSessions as session}
                        <option value={session.id}>{session.name} (ID: {session.id})</option>
                    {/each}
                </Select>
            {/if}
        </div>

        <div class="flex justify-end space-x-2 pt-4">
            <Button type="button" color="light" onclick={closeModal}>{m.move_player_to_session_cancel()}</Button>
            <Button
                type="button"
                color="blue"
                onclick={movePlayerToSession}
                disabled={!selectedPlayerId || !selectedSessionId || isSubmitting || availableSessions.length === 0}
            >
                {isSubmitting ? m.move_player_to_session_moving() : m.move_player_to_session_move()}
            </Button>
        </div>
    </div>
</Modal>
