<script lang="ts">
    import { Alert, Button, Modal, Select } from 'flowbite-svelte';
    import { invalidateAll } from '$app/navigation';
    import type { SupabaseClient } from '@supabase/supabase-js';
    import type { Database } from '$lib/database.types';

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
            error = 'Bitte wählen Sie einen Spieler aus.';
            return;
        }

        isSubmitting = true;
        error = '';

        try {
            // Get the player's scorecard ID
            const playerToRemove = players.find(p => p.playerId === selectedPlayerId);
            if (!playerToRemove) {
                throw new Error('Spieler nicht gefunden');
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
            error = e instanceof Error ? e.message : 'Ein Fehler ist aufgetreten';
        } finally {
            isSubmitting = false;
        }
    }
</script>

<Modal title="Spieler aus Session entfernen" bind:open={open} size="md" autoclose={false}>
    <div class="space-y-4">
        {#if error}
            <Alert color="red" class="mt-1">{error}</Alert>
        {/if}

        <div>
            <label for="player-select" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Spieler auswählen
            </label>
            <Select id="player-select" bind:value={selectedPlayerId} class="w-full" placeholder="">
                <option value={null} disabled selected>Bitte wählen Sie einen Spieler</option>
                {#each players as player}
                    <option value={player.playerId}>{player.playerName}</option>
                {/each}
            </Select>
        </div>

        <p class="text-sm text-red-500">
            Achtung: Diese Aktion kann nicht rückgängig gemacht werden. Alle Daten des Spielers in dieser Session werden gelöscht.
        </p>

        <div class="flex justify-end space-x-2 pt-4">
            <Button type="button" color="light" onclick={closeModal}>Abbrechen</Button>
            <Button
                type="button"
                color="red"
                onclick={removePlayerFromSession}
                disabled={!selectedPlayerId || isSubmitting}
            >
                {isSubmitting ? 'Wird entfernt...' : 'Entfernen'}
            </Button>
        </div>
    </div>
</Modal>