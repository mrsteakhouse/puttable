<script lang="ts">
    import { superForm } from 'sveltekit-superforms/client';
    import type { PageProps } from './$types';
    import { Button, Input, Label, Range } from 'flowbite-svelte';
    import { type SuperValidated } from "sveltekit-superforms";
    import fuzzysearch from 'fuzzysearch-ts';
    import CreatePlayerModal from '$lib/components/CreatePlayerModal.svelte';
    import { PlusIcon } from 'lucide-svelte';
    import type { PlayerFormSchema, SessionSchema } from '$lib/schemas';

    let { data }: PageProps = $props();

    const { form, errors, enhance } = superForm<SessionSchema>(data.form as SuperValidated<SessionSchema>, {
        dataType: 'json'
    });

    // Initialize player form for the modal
    let playerForm = $derived(data.playerForm as SuperValidated<PlayerFormSchema>);

    let players = $derived(data.players ?? []);
    let search = $state('');
    let filteredPlayers = $derived(players.filter((p) =>
        fuzzysearch(search.toLowerCase(), p.firstName.toLowerCase() + p.lastName.toLowerCase())
    ));
    let createPlayerModalOpen = $state(false);

    const togglePlayer = (player: {firstName: string, lastName: string, id: number}) => {
        if ($form.player.findLast(p => p.id === player.id)) {
            $form.player = $form.player.filter(p => p.id !== player.id);
        } else {
            $form.player = [...$form.player, player];
        }
    }

    function isSelected(id: number) {
        return $form.player.findLast(p => p.id === id);
    }

    function openCreatePlayerModal() {
        createPlayerModalOpen = true;
    }

    function handlePlayerCreated(newPlayer: { id: number, firstName: string, lastName: string }) {
        // Add the newly created player to the list and select it
        players = [...players, newPlayer];
        togglePlayer(newPlayer);
    }
</script>

<div class="max-w-2xl mx-auto p-6 space-y-6">
    <h1 class="text-2xl font-bold">🎮 Freies Spiel erstellen</h1>
    <p class="text-gray-600">Erstelle eine Session ohne Turnier und Wertungsklasse.</p>

    <form use:enhance method="POST" class="space-y-6" action="?/createSession">
        <div class="space-y-4">
            <Label>Anzahl der Löcher</Label>
            <div class="flex items-center space-x-4">
                <Range id="holeCount" min="1" max="36" step="1" bind:value={$form.holeCount} />
                <span class="text-lg font-medium">{$form.holeCount}</span>
            </div>
        </div>

        <div class="space-y-4">
            <Label>Spieler auswählen</Label>
            <Input
                type="text"
                name="search"
                placeholder="🔍 Spieler suchen..."
                bind:value={search}
                class="w-full"
            />

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {#each filteredPlayers as player}
                    <button
                        type="button"
                        class={`border rounded p-2 text-center ${
                            isSelected(player.id)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white hover:bg-gray-100'
                        }`}
                        onclick={() => togglePlayer(player)}
                    >
                        {player.firstName} {player.lastName}
                    </button>
                {/each}
            </div>
        </div>

        {#if $form.player.length < 1}
            <p class="text-red-500 text-sm">Mindestens 1 Spieler erforderlich</p>
        {/if}

        <Button type="submit" class="w-full" disabled={$form.player.length < 1}>
            🏌️ Freies Spiel starten
        </Button>
    </form>

    <div class="border-t pt-4 text-sm text-gray-600 flex items-center justify-between">
        <span>Spieler nicht gefunden?</span>
        <Button size="sm" color="blue" onclick={openCreatePlayerModal}>
            <PlusIcon class="mr-2 h-4 w-4" />
            Neuen Spieler hinzufügen
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