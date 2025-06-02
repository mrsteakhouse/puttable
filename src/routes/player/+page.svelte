<script lang="ts">
    import { Alert, Button } from 'flowbite-svelte';
    import { PlusIcon } from 'lucide-svelte';
    import { type SuperValidated } from 'sveltekit-superforms';
    import type { PageProps } from './$types';
    import CreatePlayerModal from '$lib/components/CreatePlayerModal.svelte';
    import PermissionGuard from '$lib/components/PermissionGuard.svelte';
    import { Action, Resource } from '$lib/permissions';
    import type { PlayerFormSchema } from '$lib/schemas';

    let { data }: PageProps = $props();
    let createPlayerModalOpen = $state(false);
    let availablePlayers = $derived(data.players ?? []);
    let playerForm = $derived(data.form as SuperValidated<PlayerFormSchema>)

    // Function to open the create player modal
    function openCreatePlayerModal() {
        createPlayerModalOpen = true;
    }

    // Handle player created event
    function handlePlayerCreated(newPlayer: { id: number, firstName: string, lastName: string}) {
        availablePlayers = [...availablePlayers, newPlayer];
    }
</script>

<div class="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow" role="main">
    <div class="flex justify-between items-center mb-6">
        <h1 id="players-heading" class="text-2xl font-bold dark:text-white">Spieler</h1>
        <PermissionGuard supabase={data.supabase} resource={Resource.Players} action={Action.Create}>
            <Button
                color="blue"
                onclick={openCreatePlayerModal}
                aria-label="Neuen Spieler anlegen"
            >
                <PlusIcon class="mr-2 h-5 w-5" aria-hidden="true"/>
                Spieler anlegen
            </Button>
        </PermissionGuard>
    </div>

    {#if availablePlayers && availablePlayers.length > 0}
        <!-- Players Grid -->
        <div role="grid" aria-labelledby="players-heading">
            <!-- Grid Header -->
            <div
                class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2 font-bold text-gray-700 dark:text-gray-300 p-3 border-b border-gray-200 dark:border-gray-700"
                role="row"
            >
                <div role="columnheader">Vorname</div>
                <div class="hidden sm:block" role="columnheader">Nachname</div>
                <div class="hidden sm:block" role="columnheader">Wertungsklasse</div>
            </div>

            <!-- Grid Rows -->
            <div class="grid grid-cols-1 gap-2" role="rowgroup">
                {#each availablePlayers as player, i}
                    <a
                        href={`/player/${player.id}`}
                        class="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 rounded-lg transition-colors
                              {i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
                              hover:bg-gray-100 dark:hover:bg-gray-600"
                        role="row"
                        aria-label="Details von {player.firstname} {player.lastname} anzeigen"
                    >
                        <div class="font-medium" role="cell">
                            {player.firstname}
                            <span class="sm:hidden">{player.lastname}</span>
                        </div>
                        <div class="hidden sm:block" role="cell">{player.lastname}</div>
                        <div class="hidden sm:block" role="cell">{player.rating_classes?.name || ''}</div>
                        <div class="sm:hidden text-sm text-gray-500 dark:text-gray-400" role="cell">
                            Wertungsklasse: {player.rating_classes?.name || 'Keine'}
                        </div>
                    </a>
                {/each}
            </div>
        </div>
    {:else}
        <Alert role="alert">Keine Spieler gefunden.</Alert>
    {/if}
</div>

<!-- Create Player Modal -->
<CreatePlayerModal
        bind:open={createPlayerModalOpen}
        ratingClasses={data.ratingClasses ?? []}
        form={playerForm}
        onPlayerCreated={handlePlayerCreated}
/>
