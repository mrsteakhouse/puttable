<script lang="ts">
    import { Alert, Button } from 'flowbite-svelte';
    import { PlusIcon } from 'lucide-svelte';
    import { type SuperValidated } from 'sveltekit-superforms';
    import type { PageProps } from './$types';
    import CreatePlayerModal from '$lib/components/CreatePlayerModal.svelte';
    import PermissionGuard from '$lib/components/PermissionGuard.svelte';
    import { Action, Resource } from '$lib/permissions';
    import type { PlayerFormSchema } from '$lib/schemas';
    import { m } from "$lib/paraglide/messages";

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
        <h1 id="players-heading" class="text-2xl font-bold dark:text-white">{m.player_title()}</h1>
        <PermissionGuard supabase={data.supabase} resource={Resource.Players} action={Action.Create}>
            <Button
                color="blue"
                onclick={openCreatePlayerModal}
                aria-label={m.player_create_button_aria()}
            >
                <PlusIcon class="mr-2 h-5 w-5" aria-hidden="true"/>
                {m.player_create_button()}
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
                <div role="columnheader">{m.player_first_name()}</div>
                <div class="hidden sm:block" role="columnheader">{m.player_last_name()}</div>
                <div class="hidden sm:block" role="columnheader">{m.player_rating_class()}</div>
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
                        aria-label={m.player_details_aria({ firstName: player.firstname, lastName: player.lastname })}
                    >
                        <div class="font-medium" role="cell">
                            {player.firstname}
                            <span class="sm:hidden">{player.lastname}</span>
                        </div>
                        <div class="hidden sm:block" role="cell">{player.lastname}</div>
                        <div class="hidden sm:block" role="cell">{player.rating_classes?.name || ''}</div>
                        <div class="sm:hidden text-sm text-gray-500 dark:text-gray-400" role="cell">
                            {m.player_rating_class_mobile({ ratingClass: player.rating_classes?.name || m.player_none() })}
                        </div>
                    </a>
                {/each}
            </div>
        </div>
    {:else}
        <Alert role="alert">{m.player_not_found()}</Alert>
    {/if}
</div>

<!-- Create Player Modal -->
<CreatePlayerModal
        bind:open={createPlayerModalOpen}
        ratingClasses={data.ratingClasses ?? []}
        form={playerForm}
        onPlayerCreated={handlePlayerCreated}
/>
