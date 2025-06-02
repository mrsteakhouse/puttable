<script lang="ts">
    import { Button, Input } from "flowbite-svelte";

    import { CirclePlusSolid } from "flowbite-svelte-icons"
    import fuzzysearch from "fuzzysearch-ts";
    import moment from "moment";
    import TournamentCard from "$lib/components/TournamentCard.svelte";
    import type { PageProps } from './$types'
    import PermissionGuard from '$lib/components/PermissionGuard.svelte';
    import { Action, Resource } from '$lib/permissions';
    import { onMount } from 'svelte';
    import type { TournamentDto } from '$lib/dto';
    import { goto } from '$app/navigation';

    let { data }: PageProps = $props();

    let tournaments: TournamentDto[] = $state([]);

    onMount(async () => {
        if (!data.session?.user) {
            await goto('/');
        }
        const { data: tournamentData, error } = await data.supabase.from('tournaments')
            .select();

        if (error) {
            console.error(error);
            return;
        }

        tournaments = tournamentData.map((tournament): TournamentDto => {
            return {
                id: tournament.id,
                name: tournament.name,
                startDateTime: tournament.start_date,
                endDateTime: tournament.end_date,
                numberOfHoles: tournament.number_of_holes,
                minimumCompetitorsPerSession: tournament.minimum_participants,
                description: tournament.description ?? '',
                ratingClasses: []
            }
        });
    })

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

<div class="max-w-6xl mx-auto px-4 py-8 space-y-8" role="main">
    <h1 class="text-3xl font-bold text-center dark:text-white">
        <span aria-hidden="true">📋</span> Geplante Turniere
    </h1>

    <!-- 🔍 Filter -->
    <div class="max-w-md mx-auto">
        <label for="tournament-search" class="sr-only">Turniere durchsuchen</label>
        <Input
                id="tournament-search"
                placeholder="Name oder Beschreibung durchsuchen..."
                bind:value={searchTerm}
                aria-label="Turniere nach Name oder Beschreibung durchsuchen"
                aria-controls="tournament-sections"/>
    </div>

    <div id="tournament-sections">
        <section aria-labelledby="active-tournaments-heading">
            <h2 id="active-tournaments-heading" class="text-2xl font-semibold mb-4 dark:text-white">✅ Aktive Turniere</h2>
            {#if activeEvents.length === 0}
                <p class="text-gray-500 dark:text-gray-400">Keine aktiven Turniere gefunden.</p>
            {:else}
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
                    {#each activeEvents as event}
                        <TournamentCard {event}/>
                    {/each}
                </div>
            {/if}
        </section>

        <section aria-labelledby="upcoming-tournaments-heading">
            <h2 id="upcoming-tournaments-heading" class="text-2xl font-semibold mb-4 dark:text-white">📅 Bevorstehende Turniere</h2>
            {#if futureEvents.length === 0}
                <p class="text-gray-500 dark:text-gray-400">Keine zukünftigen Turniere gefunden.</p>
            {:else}
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
                    {#each futureEvents as event}
                        <TournamentCard {event}/>
                    {/each}
                </div>
            {/if}
        </section>

        <section aria-labelledby="past-tournaments-heading">
            <h2 id="past-tournaments-heading" class="text-2xl font-semibold mt-12 mb-4 dark:text-white">⌛ Vergangene Turniere</h2>
            {#if pastEvents.length === 0}
                <p class="text-gray-500 dark:text-gray-400">Keine vergangenen Turniere gefunden.</p>
            {:else}
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80" role="list">
                    {#each pastEvents as event}
                        <TournamentCard {event}/>
                    {/each}
                </div>
            {/if}
        </section>
    </div>

    <div class="max-w-md mx-auto">
        <PermissionGuard supabase={data.supabase} resource={Resource.Tournaments} action={Action.Create}>
            <Button
                    href="/tournament/create"
                    outline
                    class="me-2 w-70 h-12"
                    size="lg"
                    aria-label="Neues Turnier erstellen"
            >
                <CirclePlusSolid class="me-2" aria-hidden="true"/>
                Turnier erstellen
            </Button>
        </PermissionGuard>
    </div>
</div>
