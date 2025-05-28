<script lang="ts">
    import { Alert, Button, Card } from 'flowbite-svelte';
    import { ArrowLeft } from 'lucide-svelte';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
</script>

<div class="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow">
    <div class="mb-6">
        <a href="/player" class="text-blue-600 hover:underline flex items-center gap-1">
            <ArrowLeft class="w-4 h-4"/>
            Zurück zur Spielerliste
        </a>
    </div>

    <div class="mb-6">
        <h1 class="text-2xl font-bold">{data.player.firstname} {data.player.lastname}</h1>
        <p class="text-gray-600 dark:text-gray-400">Wertungsklasse: {data.player.rating_classes?.name || 'Keine'}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card class="p-3">
            <h5 class="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Durchschnittliche Punktzahl
            </h5>
            <p class="mb-3 font-normal text-gray-700 dark:text-gray-400 leading-tight">
                <span class="text-4xl font-bold text-blue-600">{data.statistics.averageScore}</span>
                <br>
                <span class="text-sm">basierend auf {data.statistics.totalHolesPlayed} gespielten Löchern</span>
            </p>
        </Card>

        <Card class="p-3">
            <h5 class="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Einsen Rate
            </h5>
            <p class="mb-3 font-normal text-gray-700 dark:text-gray-400 leading-tight">
                <span class="text-4xl font-bold text-green-600">{data.statistics.onesRate}%</span>
                <br>
                <span class="text-sm">{data.statistics.totalOnes} Einsen in {data.statistics.totalHolesPlayed} Löchern</span>
            </p>
        </Card>
    </div>

    {#if data.statistics.totalHolesPlayed === 0}
        <Alert class="mt-6">
            Keine Spielstatistiken verfügbar. Der Spieler hat noch keine Scorecards.
        </Alert>
    {/if}
</div>