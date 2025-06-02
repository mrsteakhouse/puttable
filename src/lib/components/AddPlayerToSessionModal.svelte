<script lang="ts">
    import { Alert, Button, Input, Modal } from 'flowbite-svelte';
    import fuzzysearch from 'fuzzysearch-ts';
    import { invalidateAll } from '$app/navigation';
    import type { SupabaseClient } from '@supabase/supabase-js';
    import type { Database } from '$lib/database.types';

    // Props
    let {
        open = $bindable(false),
        sessionId,
        players = [],
        existingPlayerIds = [],
        supabase
    }: {
        open: boolean,
        sessionId: number,
        players: { id: number, firstName: string, lastName: string }[],
        existingPlayerIds: number[],
        supabase: SupabaseClient<Database>
    } = $props();

    // State
    let search = $state('');
    let selectedPlayers = $state<number[]>([]);
    let isSubmitting = $state(false);
    let error = $state('');

    // Computed
    let availablePlayers = $derived(
        players.filter(p => !existingPlayerIds.includes(p.id))
    );

    let filteredPlayers = $derived(
        availablePlayers.filter((p) =>
            fuzzysearch(search.toLowerCase(), `${p.firstName.toLowerCase()} ${p.lastName.toLowerCase()}`)
        )
    );

    // Reset state when modal opens
    $effect(() => {
        if (open) {
            search = '';
            selectedPlayers = [];
            error = '';
        }
    });

    // Toggle player selection
    function togglePlayer(playerId: number) {
        if (selectedPlayers.includes(playerId)) {
            selectedPlayers = selectedPlayers.filter(id => id !== playerId);
        } else {
            selectedPlayers = [...selectedPlayers, playerId];
        }
    }

    // Check if a player is selected
    function isSelected(id: number): boolean {
        return selectedPlayers.includes(id);
    }

    // Close the modal
    function closeModal() {
        open = false;
    }

    // Add players to session
    async function addPlayersToSession() {
        if (selectedPlayers.length === 0) {
            error = 'Bitte wählen Sie mindestens einen Spieler aus.';
            return;
        }

        isSubmitting = true;
        error = '';

        try {
            // Get the number of holes in the session
            const { data: sessionData, error: sessionError } = await supabase
                .from('sessions')
                .select('id, tournament:tournaments(number_of_holes), scorecards(data)')
                .eq('id', sessionId)
                .single();

            if (sessionError) return new Error(sessionError.message);

            // Determine the number of holes
            const holes = sessionData.tournament
                ? sessionData.tournament.number_of_holes
                : (sessionData.scorecards.length > 0 ? sessionData.scorecards[0].data?.length : 18);

            // Create scorecards for each selected player
            const scorecardInserts = selectedPlayers.map(playerId => ({
                session_id: sessionId,
                player_id: playerId,
                data: Array(holes).fill(0)
            }));

            const { error: insertError } = await supabase
                .from('scorecards')
                .insert(scorecardInserts);

            if (insertError) return new Error(insertError.message);

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

<Modal title="Spieler zur Session hinzufügen" bind:open={open} size="md" autoclose={false}>
    <div class="space-y-4">
        <Input
            type="text"
            name="search"
            placeholder="🔍 Spieler suchen..."
            bind:value={search}
            class="w-full"
        />

        {#if error}
            <Alert color="red" class="mt-1">{error}</Alert>
        {/if}

        <div class="max-h-60 overflow-y-auto">
            {#if filteredPlayers.length === 0}
                <p class="text-center text-gray-500 dark:text-gray-400 py-4">
                    {availablePlayers.length === 0
                        ? 'Alle Spieler sind bereits in dieser Session'
                        : 'Keine Spieler gefunden'}
                </p>
            {:else}
                <div class="grid grid-cols-2 gap-2">
                    {#each filteredPlayers as player}
                        <button
                            type="button"
                            class={`border rounded p-2 text-center ${
                                isSelected(player.id)
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
                            }`}
                            onclick={() => togglePlayer(player.id)}
                        >
                            {player.firstName} {player.lastName}
                        </button>
                    {/each}
                </div>
            {/if}
        </div>

        <div class="flex justify-end space-x-2 pt-4">
            <Button type="button" color="light" onclick={closeModal}>Abbrechen</Button>
            <Button
                type="button"
                color="blue"
                onclick={addPlayersToSession}
                disabled={selectedPlayers.length === 0 || isSubmitting}
            >
                {isSubmitting ? 'Wird hinzugefügt...' : 'Hinzufügen'}
            </Button>
        </div>
    </div>
</Modal>