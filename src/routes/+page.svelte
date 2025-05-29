<script lang="ts">
    import { Button, Input } from "flowbite-svelte";

    import { CirclePlusSolid } from "flowbite-svelte-icons"
    import fuzzysearch from "fuzzysearch-ts";
    import moment from "moment";
    import TournamentCard from "$lib/components/TournamentCard.svelte";
    import type { PageProps } from './$types'
    import PermissionGuard from '$lib/components/PermissionGuard.svelte';
    import { Action, Resource } from '$lib/permissions';

    let { data }: PageProps = $props();

    let tournaments = $derived(data.tournaments);
    let searchTerm = $state("");
    let filteredItems = $derived(tournaments?.filter((item) =>
        !searchTerm
        || fuzzysearch(searchTerm.toLowerCase(), item.name.toLowerCase())
            || fuzzysearch(searchTerm.toLowerCase(), item.description.toLowerCase()))
        ?? []);

    let now = $state(moment());
    let activeEvents = $derived(filteredItems.filter((tournament) => now.isBetween(tournament.startDateTime, tournament.endDateTime)))
    let futureEvents = $derived(filteredItems.filter((tournament) => now.isBefore(moment(tournament.startDateTime))))
    let pastEvents = $derived(filteredItems.filter((tournament) => now.isAfter(moment(tournament.endDateTime))))
</script>

<div class="max-w-6xl mx-auto px-4 py-8 space-y-8">
    <h1 class="text-3xl font-bold text-center dark:text-white">📋 Geplante Turniere</h1>

    <!-- 🔍 Filter -->
    <div class="max-w-md mx-auto">
        <Input
                placeholder="Name oder Beschreibung durchsuchen..."
                bind:value={searchTerm}/>
    </div>

    <section>
        <h2 class="text-2xl font-semibold mb-4 dark:text-white">✅ Aktive Turniere</h2>
        {#if activeEvents.length === 0}
            <p class="text-gray-500 dark:text-gray-400">Keine aktiven Turniere gefunden.</p>
        {:else}
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each activeEvents as event}
                    <TournamentCard {event}/>
                {/each}
            </div>
        {/if}
    </section>

    <section>
        <h2 class="text-2xl font-semibold mb-4 dark:text-white">📅 Bevorstehende Turniere</h2>
        {#if futureEvents.length === 0}
            <p class="text-gray-500 dark:text-gray-400">Keine zukünftigen Turniere gefunden.</p>
        {:else}
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each futureEvents as event}
                    <TournamentCard {event}/>
                {/each}
            </div>
        {/if}
    </section>

    <section>
        <h2 class="text-2xl font-semibold mt-12 mb-4 dark:text-white">⌛ Vergangene Turniere</h2>
        {#if pastEvents.length === 0}
            <p class="text-gray-500 dark:text-gray-400">Keine vergangenen Turniere gefunden.</p>
        {:else}
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
                {#each pastEvents as event}
                    <TournamentCard {event}/>
                {/each}
            </div>
        {/if}
    </section>

    <div class="max-w-md mx-auto">
        <PermissionGuard supabase={data.supabase} resource={Resource.Tournaments} action={Action.Create} >
            <Button
                    href="/tournament/create"
                    outline
                    class="me-2 w-70 h-12"
                    size="lg"
            >
                <CirclePlusSolid class="me-2"/>
                Turnier erstellen
            </Button>
        </PermissionGuard>
    </div>
</div>
