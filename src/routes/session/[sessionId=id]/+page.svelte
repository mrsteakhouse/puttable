<script lang="ts">
    import { Button, Input, Modal, TabItem, Tabs } from 'flowbite-svelte';
    import { invalidateAll } from '$app/navigation';
    import type { PageProps } from './$types';
    import moment from 'moment/moment';
    import { DATETIME_DISPLAY } from '$lib/constants';
    import { debounce } from '$lib/debounce';
    import PermissionGuard from '$lib/components/PermissionGuard.svelte';
    import { Action, Resource } from '$lib/permissions';
    import { onDestroy, onMount } from 'svelte';

    let { data }: PageProps = $props();
    const supabase = $derived(data.supabase);
    const session = $derived(data.session);
    let scorecards: {
        id: number,
        data: number[],
        playerName: string,
        playerId: number
    }[] = $derived((session.scorecard ?? []).map(sc => {
        return {
            id: sc.id,
            data: sc.data,
            playerName: `${sc.player.firstName} ${sc.player.lastName}`,
            playerId: sc.player.id
        }
    }).sort((left, right) => left.playerName.localeCompare(right.playerName)))

    let showModal = $state(false);
    let incompletePlayers: string[] = $state([]);
    let subscription: any = null;

    // Set up realtime subscription for scorecard changes
    onMount(() => {
        subscription = supabase
            .channel('scorecard-changes')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'scorecards',
                filter: `session_id=eq.${session.id}`
            }, (payload) => {
                // Update the local data when a scorecard is updated
                const updatedScorecard = payload.new;
                const scorecardIndex = scorecards.findIndex(sc => sc.id === updatedScorecard.id);

                if (scorecardIndex !== -1) {
                    // Update the scorecard data
                    for (let i = 0; i < updatedScorecard.data.length; i++) {
                        if (updatedScorecard.data[i] !== scorecards[scorecardIndex].data[i]) {
                            scorecards[scorecardIndex].data[i] = updatedScorecard.data[i]
                        }
                    }
                    scorecards[scorecardIndex].data = updatedScorecard.data;
                    // Force reactivity by creating a new array reference
                    scorecards = [...scorecards];
                }
            })
            .subscribe();
    });

    // Clean up subscription when component is destroyed
    onDestroy(() => {
        if (subscription) {
            supabase.removeChannel(subscription);
        }
    });

    // Schlagzählung pro Scorecard
    function totalScore(dataGetter: () => number[]) {
        return dataGetter().reduce((a, b) => a + b, 0);
    }

    function onesCount(dataGetter: () => number[]) {
        return dataGetter().filter(score => score === 1).length
    }

    function isComplete(dataGetter: () => number[]) {
        return dataGetter().every(score => score > 0);
    }

    function playedHolesCount(dataGetter: () => number[]) {
        return dataGetter().filter(score => score > 0).length;
    }

    async function submitScorecards() {
        incompletePlayers = scorecards
            .filter((sc) => !isComplete(() => sc.data))
            .map((sc) => sc.playerName);

        if (incompletePlayers.length > 0) {
            showModal = true;
            return;
        }

        await supabase
            .from('sessions')
            .update({ submitted_at: new Date().toISOString() })
            .eq('id', session.id);

        await invalidateAll();
    }

    // Create a debounced function for database updates
    const debouncedUpdateDatabase = debounce(async (recordId: number, arrayIndex: number, newValue: number) => {
        const { error } = await supabase.rpc('update_jsonb_array_element', {
            record_id: recordId,
            array_index: arrayIndex,
            new_value: newValue
        });

        if (error) {
            console.error('Error updating score:', error);
        }
    }, 500); // 500ms debounce

    async function handleInputChange(playerIndex: number, holeIndex: number, target: Event & {
        currentTarget: EventTarget & HTMLInputElement
    }) {
        // If session is already submitted, don't allow changes
        if (session.submissionDateTime) {
            return;
        }

        const newValue = Number(target.currentTarget.value);

        if (newValue > 7 || newValue < 1) {
            return;
        }

        // Update the local data immediately for UI responsiveness
        scorecards[playerIndex].data[holeIndex] = newValue;

        // Force reactivity by creating a new array reference
        scorecards = [...scorecards];

        // Debounce the database update
        debouncedUpdateDatabase(
            scorecards[playerIndex].id,
            holeIndex,
            newValue
        );
    }
</script>

<div class="max-w-2xl mx-auto p-4 dark:bg-gray-800 dark:rounded-lg">
    <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold dark:text-white">
            {#if session.isFreeplay}
                🎮 {session.tournamentName}
            {:else}
                🎯 Session für {session.tournamentName}
            {/if}
        </h1>
        <PermissionGuard supabase={data.supabase} resource={Resource.Sessions} action={Action.Delete}>
            <form method="POST" action="?/deleteSession"
                  onsubmit={() => confirm('Sind Sie sicher, dass Sie diese Session löschen möchten? Alle zugehörigen Scorecards werden ebenfalls gelöscht.')}>
                <Button type="submit" color="red" size="sm">
                    🗑️ Session löschen
                </Button>
            </form>
        </PermissionGuard>
    </div>

    <Tabs tabStyle="underline">
        <TabItem open={true} title="Übersicht">
            <div class="grid grid-cols-6 space-y-4 mt-4 dark:text-gray-300">
                <div class="grid col-span-2 font-medium dark:text-white">Spieler</div>
                <div class="grid font-medium dark:text-white">Punktestand</div>
                <div class="grid font-medium dark:text-white">Einsen</div>
                <div class="grid font-medium dark:text-white">Gespielte Löcher</div>
                <div class="grid"></div>
                {#each scorecards as sc}
                    <div class="grid col-span-2">
                        <a href={`/player/${sc.playerId}`} class="text-blue-600 dark:text-blue-400 hover:underline">{sc.playerName}</a>
                    </div>
                    <div class="grid">{totalScore(() => sc.data)}</div>
                    <div class="grid">{onesCount(() => sc.data)}</div>
                    <div class="grid">{playedHolesCount(() => sc.data)}</div>
                    <div class="grid"></div>
                {/each}
            </div>

            {#if !session.submissionDateTime}
                <PermissionGuard supabase={data.supabase} resource={Resource.Sessions} action={Action.Submit}>
                    <Button onclick={submitScorecards} color="green">
                        ✅ Scorecards einreichen
                    </Button>
                </PermissionGuard>
            {:else}
                <div class="text-green-600 dark:text-green-400 font-medium">✅ Bereits eingereicht
                    am {moment(session.submissionDateTime).format(DATETIME_DISPLAY)}</div>
            {/if}
        </TabItem>

        {#each scorecards as sc, i}
            <TabItem title={sc.playerName}>
                <div class="grid grid-cols-4 gap-2 mt-4 dark:text-gray-300">
                    {#each [...Array(session.holes).keys()] as index}
                        <div>
                            Loch {index + 1}
                        </div>
                        <div>
                            <Input class="w-15" type="number" max="7" min="0" bind:value={sc.data[index]}
                                   oninput={(e) => handleInputChange(i, index, e)}
                                   disabled={!!session.submissionDateTime}/>
                        </div>
                    {/each}
                </div>

                <div class="mt-4 text-gray-700 dark:text-gray-300">
                    <span class="font-semibold dark:text-white">Gesamt:</span> {totalScore(() => sc.data)}
                </div>
                <div class="mt-4 text-gray-700 dark:text-gray-300">
                    <span class="font-semibold dark:text-white">Einsen:</span> {onesCount(() => sc.data)}
                </div>
            </TabItem>
        {/each}
    </Tabs>

    <!-- ⚠️ Modal -->
    <Modal bind:open={showModal} autoclose>
        <div class="p-4 dark:bg-gray-800">
            <h2 class="text-lg font-bold mb-2 dark:text-white">⚠️ Unvollständige Scorecards</h2>
            <p class="text-sm mb-2 dark:text-gray-300">Folgende Spieler haben noch nicht alle Löcher gespielt:</p>
            <ul class="list-disc ml-6 mb-4 text-sm dark:text-gray-300">
                {#each incompletePlayers as name}
                    <li>{name}</li>
                {/each}
            </ul>
            <div class="text-right">
                <Button onclick={() => (showModal = false)}>Okay</Button>
            </div>
        </div>
    </Modal>
</div>
