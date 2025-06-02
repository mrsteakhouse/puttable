<script lang="ts">
    import { Alert, Button, Modal, Select } from 'flowbite-svelte';
    import { invalidateAll } from '$app/navigation';
    import type { SupabaseClient } from '@supabase/supabase-js';
    import type { Database } from '$lib/database.types';

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
                name: session.tournament ? session.tournament.name : 'Freies Spiel'
            }));
        } catch (e) {
            error = e instanceof Error ? e.message : 'Fehler beim Laden der Sessions';
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
            error = 'Bitte wählen Sie einen Spieler aus.';
            return;
        }

        if (!selectedSessionId) {
            error = 'Bitte wählen Sie eine Ziel-Session aus.';
            return;
        }

        isSubmitting = true;
        error = '';

        try {
            // Get the player's scorecard ID
            const playerToMove = players.find(p => p.playerId === selectedPlayerId);
            if (!playerToMove) {
                throw new Error('Spieler nicht gefunden');
            }

            // Get the number of holes in the target session
            const { data: sessionData, error: sessionError } = await supabase
                .from('sessions')
                .select('id, tournament:tournaments(number_of_holes), scorecards(data)')
                .eq('id', selectedSessionId)
                .single();

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
            error = e instanceof Error ? e.message : 'Ein Fehler ist aufgetreten';
        } finally {
            isSubmitting = false;
        }
    }
</script>

<Modal title="Spieler zu anderer Session verschieben" bind:open={open} size="md" autoclose={false}>
    <div class="space-y-4">
        {#if error}
            <Alert color="red" class="mt-1">{error}</Alert>
        {/if}

        <div>
            <label for="player-select" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Spieler auswählen
            </label>
            <Select id="player-select" bind:value={selectedPlayerId} class="w-full">
                <option value={null} disabled selected>Bitte wählen Sie einen Spieler</option>
                {#each players as player}
                    <option value={player.playerId}>{player.playerName}</option>
                {/each}
            </Select>
        </div>

        <div>
            <label for="session-select" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Ziel-Session auswählen
            </label>
            {#if isLoading}
                <p class="text-sm text-gray-500">Lade Sessions...</p>
            {:else if availableSessions.length === 0}
                <p class="text-sm text-gray-500">Keine anderen Sessions verfügbar</p>
            {:else}
                <Select id="session-select" bind:value={selectedSessionId} class="w-full" placeholder="">
                    <option value={null} disabled selected>Bitte wählen Sie eine Session</option>
                    {#each availableSessions as session}
                        <option value={session.id}>{session.name} (ID: {session.id})</option>
                    {/each}
                </Select>
            {/if}
        </div>

        <div class="flex justify-end space-x-2 pt-4">
            <Button type="button" color="light" onclick={closeModal}>Abbrechen</Button>
            <Button
                type="button"
                color="blue"
                onclick={movePlayerToSession}
                disabled={!selectedPlayerId || !selectedSessionId || isSubmitting || availableSessions.length === 0}
            >
                {isSubmitting ? 'Wird verschoben...' : 'Verschieben'}
            </Button>
        </div>
    </div>
</Modal>