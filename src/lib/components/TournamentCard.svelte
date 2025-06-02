<script lang="ts">
    import { Card } from "flowbite-svelte";
    import { Calendar, Flag, Info, Users } from 'lucide-svelte';
    import { goto } from "$app/navigation";
    import moment from "moment";
    import { marked } from "marked";

    // Define tournament type for better type safety
    type Tournament = {
        id: number;
        name: string;
        startDateTime: string | Date;
        endDateTime: string | Date;
        minimumCompetitorsPerSession: number;
        numberOfHoles: number;
        description: string;
    };

    let { event: tournament } = $props<{ event: Tournament }>();

    // Format dates consistently
    const formatDate = (date: string | Date) => moment(date).format('LLLL');

    // Get relative time
    const getRelativeTime = (date: string | Date) => moment(date).fromNow();

    // Check if date is in the future
    const isInFuture = (date: string | Date) => moment(date).isAfter(moment());

    // Check if date is in the past
    const isInPast = (date: string | Date) => moment(date).isBefore(moment());

    // Handle card click
    function handleCardClick() {
        goto(`/tournament/${tournament.id}`);
    }
</script>

<Card
    class="rounded-2xl shadow hover:shadow-lg transition p-5 cursor-pointer dark:bg-gray-800"
    onclick={handleCardClick}
    role="article"
    aria-labelledby={`tournament-${tournament.id}-title`}
>
    <div class="space-y-2">
        <h2 id={`tournament-${tournament.id}-title`} class="text-xl font-semibold dark:text-white">{tournament.name}</h2>

        <div class="flex items-start gap-2">
            <Calendar class="w-5 h-5 text-gray-600 dark:text-gray-400 mt-1" aria-hidden="true" />
            <div>
                <p class="text-sm font-medium dark:text-white">Start:</p>
                <p class="text-sm text-gray-700 dark:text-gray-400">
                    {formatDate(tournament.startDateTime)}<br/>
                    {#if isInFuture(tournament.startDateTime)}
                        <span class="text-xs text-gray-500 dark:text-gray-400 italic">({getRelativeTime(tournament.startDateTime)})</span>
                    {/if}
                </p>
            </div>
        </div>

        <div class="flex items-start gap-2">
            <Calendar class="w-5 h-5 text-gray-600 dark:text-gray-400 mt-1" aria-hidden="true" />
            <div>
                <p class="text-sm font-medium dark:text-white">Ende:</p>
                <p class="text-sm text-gray-700 dark:text-gray-400">
                    {formatDate(tournament.endDateTime)}
                    {#if isInPast(tournament.endDateTime)}
                        <span class="text-xs text-gray-500 dark:text-gray-400 italic">({getRelativeTime(tournament.endDateTime)})</span>
                    {/if}
                </p>
            </div>
        </div>

        <div class="flex items-center gap-2">
            <Users class="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
            <p class="text-sm dark:text-white">Min. Teilnehmer: {tournament.minimumCompetitorsPerSession}</p>
        </div>

        <div class="flex items-center gap-2">
            <Flag class="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
            <p class="text-sm dark:text-white">Lochanzahl: {tournament.numberOfHoles}</p>
        </div>

        <div class="flex items-start gap-2">
            <Info class="w-5 h-5 text-gray-600 dark:text-gray-400 mt-1" aria-hidden="true" />
            <div class="text-sm text-gray-700 dark:text-gray-400 whitespace-pre-line">
                {@html marked(tournament.description)}
            </div>
        </div>
    </div>
</Card>
