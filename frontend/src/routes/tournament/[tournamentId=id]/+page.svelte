<script lang="ts">
    import { Button, Tooltip } from "flowbite-svelte";
    import { ArrowLeft, Calendar, Flag, Info, Users } from "lucide-svelte";
    import moment from "moment";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import { marked } from "marked";
    import type { PageProps } from './$types';

    const tournamentId = Number(page.params.tournamentId);

    let { data }: PageProps = $props();
    let tournament = $derived(data.tournament);

    let allowStartSession = $derived(moment().isBetween(
        tournament.startDateTime,
        tournament.endDateTime
    ));
</script>

<div class="max-w-xl mx-auto p-6 py-8 space-y-6">
    <a href="/" class="text-blue-600 hover:underline flex items-center gap-1">
        <ArrowLeft class="w-4 h-4"/>
        Zurück zur Übersicht
    </a>

    <h1 class="text-3xl font-bold">{tournament.name}</h1>

    <div class="space-y-4 text-sm">
        <div class="flex items-start gap-2">
            <Calendar class="w-5 h-5 text-gray-600 mt-1"/>
            <div>
                <p class="font-medium">Start:</p>
                <p>
                    {moment(tournament.startDateTime).format('LLLL')}
                    <br/>
                    {#if moment(tournament.startDateTime).isAfter(moment())}
                        <span class="text-xs text-gray-500 italic">({moment(tournament.startDateTime).fromNow()}
                            )</span>
                    {/if}
                </p>
            </div>
        </div>

        <div class="flex items-start gap-2">
            <Calendar class="w-5 h-5 text-gray-600 mt-1"/>
            <div>
                <p class="font-medium">Ende:</p>
                <p>{moment(tournament.endDateTime).format('LLLL')}</p>
                {#if moment(tournament.endDateTime).isAfter(moment())}
                    <span class="text-xs text-gray-500 italic">({moment(tournament.endDateTime).fromNow()})</span>
                {/if}
            </div>
        </div>

        <div class="flex items-center gap-2">
            <Users class="w-5 h-5 text-gray-600"/>
            <p>Mindestteilnehmer: {tournament.minimumCompetitorsPerSession}</p>
        </div>

        <div class="flex items-center gap-2">
            <Flag class="w-5 h-5 text-gray-600"/>
            <p>Lochanzahl: {tournament.numberOfHoles}</p>
        </div>

        <div class="flex items-start gap-2">
            <Info class="w-5 h-5 text-gray-600 mt-1"/>
            <p class="whitespace-pre-line">{@html marked(tournament.description ?? '')}</p>
        </div>
    </div>


    <div class="flex items-center pt-10">
        <a
                href={`/tournament/${tournament.id}/edit`}
                class="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
        >
            ✏️ Event bearbeiten
        </a>
    </div>


    <div class="flex items-center pt-10">
        <Button id="start-new-session-button" onclick={() => goto("/session/create")} disabled={!allowStartSession}>
            Neue Runde erstellen
        </Button>
        {#if !allowStartSession}
            <Tooltip triggeredBy="#start-new-session-button" placement="bottom">
                {#if moment().isBefore(tournament.startDateTime)}
                    Das Turnier hat noch nicht begonnen.
                {:else if moment().isAfter(tournament.endDateTime)}
                    Das Turnier ist bereits beendet.
                {/if}
            </Tooltip>
        {/if}
    </div>
</div>