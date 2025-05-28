<!-- src/routes/tournaments/[id]/sessions/create/+page.svelte -->
<script lang="ts">
    import { superForm } from 'sveltekit-superforms/client';
    import type { PageProps } from './$types';
    import { Button, Input } from 'flowbite-svelte';
    import SuperDebug, { type SuperValidated } from "sveltekit-superforms";
    import type { SessionSchema } from "$lib/schemas";
    import fuzzysearch from 'fuzzysearch-ts';

    let { data }: PageProps = $props();

    const { form, errors, enhance } = superForm(data.form as SuperValidated<SessionSchema>, {
        dataType: 'json'
    });

    const players = $derived(data.players ?? []);
    let search = $state('');
    let filteredPlayers = $derived(players.filter((p) =>
        fuzzysearch(search, p.firstName.toLowerCase())
        || fuzzysearch(search, p.lastName.toLowerCase())
    ));

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

    const minParticipants = data.tournament?.minimumCompetitorsPerSession ?? 1;
</script>

<div class="max-w-2xl mx-auto p-6 space-y-6">
    <h1 class="text-2xl font-bold">➕ Neue Runde für {data.tournament?.name ?? ''}</h1>

    <form use:enhance method="POST" class="space-y-6">
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

        {#if $form.player.length < minParticipants}
            <p class="text-red-500 text-sm">Mindestens {minParticipants} Spieler erforderlich</p>
        {/if}

        <input type="hidden" name="tournament_id" value={$form.tournamentId}/>

        <Button type="submit" class="w-full" disabled={$form.player.length < minParticipants}>
            🏌️ Runde starten
        </Button>
    </form>

    <div class="border-t pt-4 text-sm text-gray-600">
        Spieler nicht gefunden? <a class="underline" href="/players/create">Neuen Spieler hinzufügen</a>
    </div>
</div>