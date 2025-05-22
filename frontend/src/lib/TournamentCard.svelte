<script lang="ts">
    import {Card} from "flowbite-svelte";

    import {Calendar, Flag, Info, Users} from 'lucide-svelte';
    import {goto} from "$app/navigation";
    import moment from "moment";
    import {marked} from "marked";

    let {event: tournament} = $props();
</script>

<Card class="rounded-2xl shadow hover:shadow-lg transition p-5 cursor-pointer" onclick={() => goto(`/tournament/${tournament.id}`)}>
    <div class="space-y-2">
        <h2 class="text-xl font-semibold">{tournament.name}</h2>

        <div class="flex items-start gap-2">
            <Calendar class="w-5 h-5 text-gray-600 mt-1"/>
            <div>
                <p class="text-sm font-medium">Start:</p>
                <p class="text-sm text-gray-700 dark:text-gray-400">
                    {moment(tournament.startDateTime).format('LLLL')}<br/>
                    {#if moment(tournament.startDateTime).isAfter(moment())}
                        <span class="text-xs text-gray-500 italic">({moment(tournament.startDateTime).fromNow()})</span>
                    {/if}
                </p>
            </div>
        </div>

        <div class="flex items-start gap-2">
            <Calendar class="w-5 h-5 text-gray-600 mt-1"/>
            <div>
                <p class="text-sm font-medium">Ende:</p>
                <p class="text-sm text-gray-700 dark:text-gray-400">
                    {moment(tournament.endDateTime).format('LLLL')}
                    {#if moment(tournament.endDateTime).isBefore(moment())}
                        <span class="text-xs text-gray-500 italic">({moment(tournament.endDateTime).fromNow()})</span>
                    {/if}
                </p>
            </div>
        </div>

        <div class="flex items-center gap-2">
            <Users class="w-5 h-5 text-gray-600"/>
            <p class="text-sm">Min. Teilnehmer: {tournament.minimumCompetitorsPerSession}</p>
        </div>

        <div class="flex items-center gap-2">
            <Flag class="w-5 h-5 text-gray-600"/>
            <p class="text-sm">Lochanzahl: {tournament.numberOfHoles}</p>
        </div>

        <div class="flex items-start gap-2">
            <Info class="w-5 h-5 text-gray-600 mt-1"/>
            <p class="text-sm text-gray-700 dark:text-gray-400 whitespace-pre-line">
                {@html marked(tournament.description)}
            </p>
        </div>
    </div>
</Card>