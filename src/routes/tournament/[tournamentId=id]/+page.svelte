<script lang="ts">
    import { Badge, Button, Card, Tooltip } from "flowbite-svelte";
    import { ArrowLeft, Award, BarChart, Calendar, Clock, Flag, Info, Medal, User, Users } from "lucide-svelte";
    import moment from "moment";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import { marked } from "marked";
    import type { PageProps } from './$types';
    import type { ScoreCardDto, SessionDto, TournamentDto } from '$lib/dto';
    import PermissionGuard from '$lib/components/PermissionGuard.svelte';
    import { Action, Resource } from '$lib/permissions';

    const tournamentId = Number(page.params.tournamentId);

    let { data }: PageProps = $props();
    let tournament = $derived(data.tournament ?? {} as TournamentDto);
    let sessions = $derived(data.sessions ?? [] as SessionDto[]);

    let allowStartSession = $derived(moment().isBetween(
        tournament.startDateTime,
        tournament.endDateTime
    ));

    // Calculate total score for a scorecard
    function totalScore(scorecard: ScoreCardDto): number {
        return scorecard.data.reduce((a, b) => a + b, 0);
    }

    // Count number of ones (aces/holes-in-one) in a scorecard
    function onesCount(scorecard: ScoreCardDto): number {
        return scorecard.data.filter(score => score === 1).length;
    }

    // Get player rankings based on their best (lowest) score, grouped by rating class
    function getPlayerRankingsByClass() {
        // Get all submitted sessions
        const submittedSessions = sessions.filter(session => session.submissionDateTime);

        // Create a map to track the best score for each player
        const playerBestScores = new Map<string, Map<number, {
            playerId: number,
            playerName: string,
            score: number,
            ones: number,
            ratingClass: string
        }>>();

        // Process all scorecards from all submitted sessions
        submittedSessions.forEach(session => {
            session.scorecard.forEach(scorecard => {
                const player = scorecard.player;
                const score = totalScore(scorecard);

                if (!playerBestScores.has(player.ratingClass)) {
                    playerBestScores.set(player.ratingClass, new Map<number, {
                        playerId: number,
                        playerName: string,
                        score: number,
                        ones: number,
                        ratingClass: string
                    }>());
                }
                let ratingClassScores = playerBestScores.get(player.ratingClass)!;
                // If we haven't seen this player before, or if this score is better than their previous best
                if (!ratingClassScores.has(player.id) || score < ratingClassScores.get(player.id)!.score) {
                    ratingClassScores.set(player.id, {
                        playerId: player.id,
                        playerName: `${player.firstName} ${player.lastName}`,
                        score: score,
                        ones: onesCount(scorecard),
                        ratingClass: player.ratingClass
                    });
                }
            });
        });

        // Convert each Map of players to an array and sort them
        const sortedPlayersByClass = new Map<string, Array<{
            playerId: number,
            playerName: string,
            score: number,
            ones: number,
            ratingClass: string
        }>>();

        playerBestScores.forEach((playersMap, ratingClass) => {
            // Convert Map to Array
            const playersArray = Array.from(playersMap.values());

            // Sort by score (ascending) and then by ones (descending)
            const sortedPlayers = playersArray.sort((a, b) =>
                a.score === b.score ? b.ones - a.ones : a.score - b.score
            );

            sortedPlayersByClass.set(ratingClass, sortedPlayers);
        });

        return sortedPlayersByClass;
    }

    const playerRankingsByClass = $derived(getPlayerRankingsByClass());
</script>

<div class="max-w-xl mx-auto p-6 py-8 space-y-6 dark:bg-gray-800 dark:rounded-lg">
    <a href="/" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
        <ArrowLeft class="w-4 h-4"/>
        Zurück zur Übersicht
    </a>

    <h1 class="text-3xl font-bold dark:text-white">{tournament.name}</h1>

    <div class="space-y-4 text-sm dark:text-gray-300">
        <div class="flex items-start gap-2">
            <Calendar class="w-5 h-5 text-gray-600 dark:text-gray-400 mt-1"/>
            <div>
                <p class="font-medium dark:text-white">Start:</p>
                <p>
                    {moment(tournament.startDateTime).format('LLLL')}
                    <br/>
                    {#if moment(tournament.startDateTime).isAfter(moment())}
                        <span class="text-xs text-gray-500 dark:text-gray-400 italic">({moment(tournament.startDateTime).fromNow()}
                            )</span>
                    {/if}
                </p>
            </div>
        </div>

        <div class="flex items-start gap-2">
            <Calendar class="w-5 h-5 text-gray-600 dark:text-gray-400 mt-1"/>
            <div>
                <p class="font-medium dark:text-white">Ende:</p>
                <p>{moment(tournament.endDateTime).format('LLLL')}</p>
                {#if moment(tournament.endDateTime).isAfter(moment())}
                    <span class="text-xs text-gray-500 dark:text-gray-400 italic">({moment(tournament.endDateTime).fromNow()})</span>
                {/if}
            </div>
        </div>

        <div class="flex items-center gap-2">
            <Users class="w-5 h-5 text-gray-600 dark:text-gray-400"/>
            <p class="dark:text-white">Mindestteilnehmer:</p> {tournament.minimumCompetitorsPerSession}
        </div>

        <div class="flex items-center gap-2">
            <Flag class="w-5 h-5 text-gray-600 dark:text-gray-400"/>
            <p class="dark:text-white">Lochanzahl:</p> {tournament.numberOfHoles}
        </div>

        <div class="flex items-center gap-2">
            <Award class="w-5 h-5 text-gray-600 dark:text-gray-400"/>
            <p class="dark:text-white">Wertungsklassen:</p>
            {#each tournament.ratingClasses as ratingClass}
                <Badge large class="mx-2">{ratingClass.name}</Badge>
            {/each}
        </div>

        <div class="flex items-start gap-2">
            <Info class="w-5 h-5 text-gray-600 dark:text-gray-400 mt-1"/>
            <p class="whitespace-pre-line dark:text-gray-300">{@html marked(tournament.description ?? '')}</p>
        </div>
    </div>


    <div class="flex items-center gap-2">
        <PermissionGuard supabase={data.supabase} resource={Resource.Tournaments} action={Action.Update}>
            <Button color="blue" class="text-sm" href={`/tournament/${tournament.id}/edit`}>
                ✏️ Event bearbeiten
            </Button>
        </PermissionGuard>
        <PermissionGuard supabase={data.supabase} resource={Resource.Tournaments} action={Action.Delete}>
            <form method="POST" action="?/deleteTournament"
                  onsubmit={() => confirm('Sind Sie sicher, dass Sie dieses Event löschen möchten? Alle zugehörigen Sessions werden ebenfalls gelöscht.')}>
                <Button type="submit" color="red" class="text-sm">
                    🗑️ Turnier löschen
                </Button>
            </form>
        </PermissionGuard>
    </div>

    <!-- Player Rankings Section -->
    <div class="pt-10 space-y-4">
        <h2 class="text-xl font-bold flex items-center gap-2 dark:text-white">
            <Medal class="w-5 h-5 dark:text-gray-400"/>
            Rangliste
        </h2>

        {#if playerRankingsByClass.size === 0}
            <p class="text-gray-500 dark:text-gray-400 italic">Keine Ergebnisse verfügbar.</p>
        {:else}
            {#each Array.from(playerRankingsByClass.entries()) as [ratingClass, players]}
                <div class="mb-8">
                    <h3 class="text-lg font-semibold mb-2 dark:text-white">
                        <Badge large class="mr-2">{ratingClass}</Badge>
                    </h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                            <thead class="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" class="px-4 py-3">Rang</th>
                                    <th scope="col" class="px-4 py-3">Spieler</th>
                                    <th scope="col" class="px-4 py-3">Punkte</th>
                                    <th scope="col" class="px-4 py-3">Einsen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each players as player, index}
                                    <tr class="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td class="px-4 py-2 font-medium dark:text-white">
                                            {index + 1}.
                                            {#if index === 0}
                                                🥇
                                            {:else if index === 1}
                                                🥈
                                            {:else if index === 2}
                                                🥉
                                            {/if}
                                        </td>
                                        <td class="px-4 py-2">
                                            <a href={`/player/${player.playerId}`} class="text-blue-600 dark:text-blue-400 hover:underline">
                                                {player.playerName}
                                            </a>
                                        </td>
                                        <td class="px-4 py-2 font-medium dark:text-white">{player.score}</td>
                                        <td class="px-4 py-2">{player.ones}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>
            {/each}
        {/if}
    </div>

    <PermissionGuard supabase={data.supabase} resource={Resource.Sessions} action={Action.Read}>

        <!-- Sessions Overview Section -->
    <div class="pt-10 space-y-4">
        <h2 class="text-xl font-bold flex items-center gap-2 dark:text-white">
            <BarChart class="w-5 h-5 dark:text-gray-400"/>
            Aktive Runden
        </h2>

        {#if sessions.filter(session => !session.submissionDateTime).length === 0}
            <p class="text-gray-500 dark:text-gray-400 italic">Keine aktiven Runden vorhanden.</p>
        {:else}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {#each sessions.filter(session => !session.submissionDateTime) as session}
                    <Card class="hover:shadow-lg transition-shadow dark:bg-gray-800">
                        <div class="p-2">
                            <div class="flex justify-between items-start mb-2">
                                <h3 class="font-semibold text-lg dark:text-white">
                                    <a href={`/session/${session.id}`} class="text-blue-600 dark:text-blue-400 hover:underline">
                                        Runde #{session.id}
                                    </a>
                                </h3>
                                <Badge color="yellow" class="flex items-center gap-1">
                                    <Clock class="w-3 h-3"/>
                                    Aktiv
                                </Badge>
                            </div>

                            <div class="grid grid-cols-2 gap-2 text-sm dark:text-gray-300">
                                <div class="flex items-center gap-1">
                                    <User class="w-4 h-4 text-gray-600 dark:text-gray-400"/>
                                    <span>{session.scorecard.length} Spieler</span>
                                </div>
                            </div>

                            <div class="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                <div class="grid grid-cols-3 gap-1 text-xs">
                                    {#each session.scorecard.sort() as card, i}
                                        {#if i < 3}
                                            <div class="truncate">
                                                <a href={`/player/${card.player.id}`}
                                                   class="text-blue-600 dark:text-blue-400 hover:underline">
                                                    {card.player.firstName} {card.player.lastName}
                                                </a>
                                            </div>
                                        {/if}
                                    {/each}
                                    {#if session.scorecard.length > 3}
                                        <div class="text-gray-500 dark:text-gray-400">+{session.scorecard.length - 3} weitere</div>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    </Card>
                {/each}
            </div>
        {/if}
    </div>
    </PermissionGuard>

    <PermissionGuard supabase={data.supabase} resource={Resource.Sessions} action={Action.Create}>
        <div class="flex items-center pt-10">
            <Button id="start-new-session-button" onclick={() => goto(`/tournament/${tournamentId}/session/create`)}
                    disabled={!allowStartSession}>
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
    </PermissionGuard>
</div>
