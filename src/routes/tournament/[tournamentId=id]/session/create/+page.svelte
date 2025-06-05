<!-- src/routes/tournament/[tournamentId=id]/session/create/+page.svelte -->
<script lang="ts">
    import { superForm } from 'sveltekit-superforms/client';
    import type { PageProps } from './$types';
    import { Button, Input } from 'flowbite-svelte';
    import { type SuperValidated } from "sveltekit-superforms";
    import type { PlayerFormSchema, SessionSchema } from "$lib/schemas";
    import fuzzysearch from 'fuzzysearch-ts';
    import CreatePlayerModal from '$lib/components/CreatePlayerModal.svelte';
    import { PlusIcon } from 'lucide-svelte';
    import { m } from "$lib/paraglide/messages";

    // Define player type for better type safety
    type Player = {
        id: number;
        firstName: string;
        lastName: string;
    };

    // Page props
    let { data }: PageProps = $props();

    // Form handling
    const { form, enhance, submitting } = superForm<SessionSchema>(data.form as SuperValidated<SessionSchema>, {
        dataType: 'json'
    });

    // Initialize player form for the modal
    let playerForm = $derived(data.playerForm as SuperValidated<PlayerFormSchema>);

    // Player state management
    let players = $derived(data.players ?? [] as Player[]);
    let search = $state('');
    let filteredPlayers = $derived(players.filter((p) =>
        fuzzysearch(search.toLowerCase(), `${p.firstName.toLowerCase()} ${p.lastName.toLowerCase()}`)
    ));
    let createPlayerModalOpen = $state(false);

    // Tournament settings
    const minParticipants = data.tournament?.minimumCompetitorsPerSession ?? 1;
    const tournamentName = data.tournament?.name ?? '';
    const isFormValid = $derived($form.player.length >= minParticipants);

    /**
     * Toggle player selection
     */
    function togglePlayer(player: Player) {
        const isPlayerSelected = isSelected(player.id);

        if (isPlayerSelected) {
            $form.player = $form.player.filter(p => p.id !== player.id);
        } else {
            $form.player = [...$form.player, player];
        }
    }

    /**
     * Check if a player is selected
     */
    function isSelected(id: number): boolean {
        return $form.player.some(p => p.id === id);
    }

    /**
     * Open the create player modal
     */
    function openCreatePlayerModal() {
        createPlayerModalOpen = true;
    }

    /**
     * Handle player creation from modal
     */
    function handlePlayerCreated(newPlayer: Player) {
        // Add the newly created player to the list and select it
        players = [...players, newPlayer];
        togglePlayer(newPlayer);
    }
</script>

<div class="max-w-2xl mx-auto p-6 space-y-6">
    <h1 class="text-2xl font-bold">➕ {m.tournament_session_create_title({ tournamentName: tournamentName })}</h1>

    <form
        use:enhance
        method="POST"
        class="space-y-6"
        action="?/createSession"
    >
        <div>
            <label for="player-search" class="sr-only">{m.tournament_session_create_search_label()}</label>
            <Input
                id="player-search"
                type="text"
                name="search"
                placeholder={m.tournament_session_create_search_players()}
                bind:value={search}
                class="w-full"
                aria-controls="player-list"
            />
        </div>

        <div
            id="player-list"
            class="grid grid-cols-2 sm:grid-cols-3 gap-2"
            role="group"
            aria-label={m.tournament_session_create_available_players()}
        >
            {#each filteredPlayers as player}
                <button
                    type="button"
                    class={`border rounded p-2 text-center ${
                        isSelected(player.id)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
                    }`}
                    onclick={() => togglePlayer(player)}
                    aria-pressed={isSelected(player.id)}
                    aria-label={isSelected(player.id)
                        ? m.tournament_session_create_deselect_player({ firstName: player.firstName, lastName: player.lastName })
                        : m.tournament_session_create_select_player({ firstName: player.firstName, lastName: player.lastName })}
                >
                    {player.firstName} {player.lastName}
                </button>
            {/each}

            {#if filteredPlayers.length === 0}
                <p class="col-span-full text-center text-gray-500 dark:text-gray-400 py-4">
                    {m.tournament_session_create_no_players()}
                </p>
            {/if}
        </div>

        {#if !isFormValid}
            <p class="text-red-500 text-sm" role="alert">
                {m.tournament_session_create_min_players({ minPlayerCount: minParticipants })}
            </p>
        {/if}

        <input type="hidden" name="tournament_id" value={$form.tournamentId}/>

        <Button
            type="submit"
            class="w-full"
            disabled={!isFormValid || $submitting}
            aria-disabled={!isFormValid || $submitting}
        >
            {m.tournament_session_create_start()}
        </Button>
    </form>

    <div class="border-t pt-4 text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between">
        <span>{m.tournament_session_create_player_not_found()}</span>
        <Button
            size="sm"
            color="blue"
            onclick={openCreatePlayerModal}
            aria-label={m.tournament_session_create_add_player()}
        >
            <PlusIcon class="mr-2 h-4 w-4" aria-hidden="true" />
            {m.tournament_session_create_add_player()}
        </Button>
    </div>

    <!-- Create Player Modal -->
    <CreatePlayerModal
        bind:open={createPlayerModalOpen}
        ratingClasses={data.ratingClasses ?? []}
        form={playerForm}
        onPlayerCreated={handlePlayerCreated}
    />
</div>
