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
    import { hasPermission } from '$lib/rbac';
    import AddPlayerToSessionModal from '$lib/components/AddPlayerToSessionModal.svelte';
    import MovePlayerToSessionModal from '$lib/components/MovePlayerToSessionModal.svelte';
    import RemovePlayerFromSessionModal from '$lib/components/RemovePlayerFromSessionModal.svelte';
    import { ArrowRightIcon, Clock, PlusIcon, TrashIcon } from 'lucide-svelte';
    import { m } from "$lib/paraglide/messages";
    import * as Sentry from "@sentry/sveltekit";

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
    let showDeleteModal = $state(false);
    let showAddPlayerModal = $state(false);
    let showMovePlayerModal = $state(false);
    let showRemovePlayerModal = $state(false);
    let incompletePlayers: string[] = $state([]);
    let subscription: any = null;
    let deleteForm: HTMLFormElement | null = $state(null);

    // Track if user has any permissions for actions
    let canUpdate = $state(false);
    let canDelete = $state(false);
    let canSubmit = $state(false);

    // Determine if we should show the Actions tab
    let showActionsTab = $derived(canUpdate || canDelete);

    // Get all players for the add player modal
    let allPlayers = $derived(data.players ?? []);
    // Get existing player IDs for filtering in the add player modal
    let existingPlayerIds = $derived(scorecards.map(sc => sc.playerId));
    // Format players for the move and remove player modals
    let formattedPlayers = $derived(scorecards.map(sc => ({
        id: sc.id,
        playerId: sc.playerId,
        playerName: sc.playerName,
        scorecardId: sc.id
    })));

    // Set up realtime subscription for scorecard changes and check permissions
    onMount(async () => {
        // Check permissions
        canUpdate = await hasPermission(supabase, Resource.Sessions, Action.Update);
        canDelete = await hasPermission(supabase, Resource.Sessions, Action.Delete);
        canSubmit = await hasPermission(supabase, Resource.Sessions, Action.Submit);

        // Set up realtime subscription
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

    // Function to open delete confirmation modal
    function openDeleteModal() {
        showDeleteModal = true;
    }

    // Function to handle session deletion
    function handleDelete() {
        if (deleteForm) {
            deleteForm.submit();
        }
    }

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

        const { error } = await supabase
            .from('sessions')
            .update({ submitted_at: moment().toISOString() })
            .eq('id', session.id);

        if (error) {
            Sentry.captureException(error);
        }

        await invalidateAll();
    }

    // Store pending changes
    let pendingChanges: {
        recordId: number,
        arrayIndex: number,
        newValue: number
    }[] = [];

    // Create a debounced function for database updates
    const debouncedUpdateDatabase = debounce(async () => {
        // Process all pending changes
        const changes = [...pendingChanges]; // Create a copy of the current changes
        pendingChanges = []; // Clear the pending changes

        // Create a map to store the latest change for each record and array index
        const latestChanges = new Map<string, { recordId: number, arrayIndex: number, newValue: number }>();

        // Process changes to keep only the latest change for each record and array index
        for (const change of changes) {
            const key = `${change.recordId}-${change.arrayIndex}`;
            latestChanges.set(key, change);
        }

        // Group latest changes by recordId to minimize database calls
        const changesByRecordId = {} as Record<number, { arrayIndex: number, newValue: number }[]>;

        for (const change of latestChanges.values()) {
            if (!changesByRecordId[change.recordId]) {
                changesByRecordId[change.recordId] = [];
            }
            changesByRecordId[change.recordId].push({
                arrayIndex: change.arrayIndex,
                newValue: change.newValue
            });
        }

        // Process each group of changes
        for (const [recordId, recordChanges] of Object.entries(changesByRecordId)) {
            // Process each change for this record
            for (const change of recordChanges) {
                const { error } = await supabase.rpc('update_jsonb_array_element', {
                    record_id: Number(recordId),
                    array_index: change.arrayIndex,
                    new_value: change.newValue
                });

                if (error) {
                    console.error('Error updating score:', error);
                }
            }
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

        // Add the change to the pending changes
        pendingChanges.push({
            recordId: scorecards[playerIndex].id,
            arrayIndex: holeIndex,
            newValue: newValue
        });

        // Trigger the debounced update
        debouncedUpdateDatabase();
    }
</script>

<div class="max-w-2xl mx-auto p-4 dark:bg-gray-800 dark:rounded-lg">
    <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold dark:text-white">
            {#if session.isFreeplay}
                🎮 {session.tournamentName}
            {:else}
                🎯 {m.session_for({ tournamentName: session.tournamentName })}
            {/if}
        </h1>
    </div>

    <Tabs tabStyle="underline" ulClass="flex-wrap">
        <TabItem open={true} title={m.session_overview()}>
            <!-- Responsive grid that adapts to screen size -->
            <div class="mt-4 dark:text-gray-300">
                <!-- Header row - hidden on small screens, visible on md and up -->
                <div class="hidden md:grid md:grid-cols-6 md:gap-2 font-medium dark:text-white mb-2">
                    <div class="col-span-2">{m.session_player()}</div>
                    <div>{m.session_score()}</div>
                    <div>{m.session_ones()}</div>
                    <div>{m.session_played_holes()}</div>
                    <div></div>
                </div>

                <!-- Player cards for small screens, grid for larger screens -->
                {#each scorecards as sc}
                    <!-- Mobile view (card style) -->
                    <div class="md:hidden bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-3">
                        <div class="font-medium dark:text-white mb-1">
                            <a href={`/player/${sc.playerId}`} class="text-blue-600 dark:text-blue-400 hover:underline">{sc.playerName}</a>
                        </div>
                        <div class="grid grid-cols-3 gap-2 text-sm">
                            <div>
                                <span class="font-medium dark:text-white">{m.session_score_label()}</span> {totalScore(() => sc.data)}
                            </div>
                            <div>
                                <span class="font-medium dark:text-white">{m.session_ones_label()}</span> {onesCount(() => sc.data)}
                            </div>
                            <div>
                                <span class="font-medium dark:text-white">{m.session_holes_label()}</span> {playedHolesCount(() => sc.data)}
                            </div>
                        </div>
                    </div>

                    <!-- Desktop view (grid row) -->
                    <div class="hidden md:grid md:grid-cols-6 md:gap-2 md:mb-2 items-center">
                        <div class="col-span-2">
                            <a href={`/player/${sc.playerId}`} class="text-blue-600 dark:text-blue-400 hover:underline">{sc.playerName}</a>
                        </div>
                        <div>{totalScore(() => sc.data)}</div>
                        <div>{onesCount(() => sc.data)}</div>
                        <div>{playedHolesCount(() => sc.data)}</div>
                        <div></div>
                    </div>
                {/each}
            </div>

            {#if !session.submissionDateTime}
                {#if canSubmit}
                    {#if !session.isFreeplay && moment().isBetween(moment(session.tournamentEndDateTime).subtract(31, 'minutes'), moment(session.tournamentEndDateTime))}
                        <!-- Tournament end warning -->
                        <div class="my-4 p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg flex items-center">
                            <Clock class="w-5 h-5 mr-2" aria-hidden="true"/>
                            <p>
                                <strong>{m.tournament_detail_warning()}</strong> {m.tournament_detail_minutes_remaining({ minutes: moment(session.tournamentEndDateTime).diff(moment(), 'minutes') })}
                            </p>
                        </div>
                    {/if}

                    <Button onclick={submitScorecards} color="green">
                        ✅ {m.session_submit_scorecards()}
                    </Button>
                {/if}
            {:else}
                <div class="text-green-600 dark:text-green-400 font-medium">✅ {m.session_already_submitted({ submissionDate: moment(session.submissionDateTime).format(DATETIME_DISPLAY) })}</div>
            {/if}
        </TabItem>

        {#each scorecards as sc, i}
            <TabItem title={sc.playerName}>
                <div class="grid grid-cols-4 gap-2 mt-4 dark:text-gray-300">
                    {#each [...Array(session.holes).keys()] as index}
                        <div>
                            {m.session_hole({ holeNumber: index + 1 })}
                        </div>
                        <div>
                            <Input class="w-15" type="number" max="7" min="0" bind:value={sc.data[index]}
                                   oninput={(e) => handleInputChange(i, index, e)}
                                   disabled={!!session.submissionDateTime}/>
                        </div>
                    {/each}
                </div>

                <div class="mt-4 text-gray-700 dark:text-gray-300">
                    <span class="font-semibold dark:text-white">{m.session_total()}</span> {totalScore(() => sc.data)}
                </div>
                <div class="mt-4 text-gray-700 dark:text-gray-300">
                    <span class="font-semibold dark:text-white">{m.session_ones_label()}</span> {onesCount(() => sc.data)}
                </div>
            </TabItem>
        {/each}

        {#if showActionsTab}
            <TabItem title={m.session_actions()}>
                <div class="space-y-4 mt-4">
                    <h2 class="text-xl font-semibold dark:text-white">{m.session_available_actions()}</h2>

                    {#if !session.submissionDateTime}
                        <div class="space-y-2">
                            <h3 class="text-lg font-medium dark:text-white">{m.session_player_management()}</h3>
                            <div class="flex flex-wrap gap-2">
                                <PermissionGuard supabase={data.supabase} resource={Resource.Sessions} action={Action.Update}>
                                    <Button type="button" color="blue" onclick={() => showAddPlayerModal = true}>
                                        <PlusIcon class="h-4 w-4 mr-1" />
                                        {m.session_add_player()}
                                    </Button>
                                </PermissionGuard>
                                <PermissionGuard supabase={data.supabase} resource={Resource.Sessions} action={Action.Update}>
                                    <Button type="button" color="blue" onclick={() => showMovePlayerModal = true}>
                                        <ArrowRightIcon class="h-4 w-4 mr-1" />
                                        {m.session_move_player()}
                                    </Button>
                                </PermissionGuard>
                                <PermissionGuard supabase={data.supabase} resource={Resource.Sessions} action={Action.Update}>
                                    <Button type="button" color="red" onclick={() => showRemovePlayerModal = true}>
                                        <TrashIcon class="h-4 w-4 mr-1" />
                                        {m.session_remove_player()}
                                    </Button>
                                </PermissionGuard>
                            </div>
                        </div>
                    {/if}

                    <div class="space-y-2">
                        <h3 class="text-lg font-medium dark:text-white">{m.session_danger_zone()}</h3>
                        <div class="flex flex-wrap gap-2">
                            <PermissionGuard supabase={data.supabase} resource={Resource.Sessions} action={Action.Delete}>
                                <form method="POST" action="?/deleteSession" bind:this={deleteForm}>
                                    <Button type="button" color="red" onclick={openDeleteModal}>
                                        🗑️ {m.session_delete()}
                                    </Button>
                                </form>
                            </PermissionGuard>
                        </div>
                    </div>
                </div>
            </TabItem>
        {/if}
    </Tabs>

    <!-- ⚠️ Modal -->
    <Modal bind:open={showModal} autoclose size="sm">
        <div class="p-4 dark:bg-gray-800">
            <h2 class="text-lg font-bold mb-2 dark:text-white">⚠️ {m.session_incomplete_scorecards()}</h2>
            <p class="text-sm mb-2 dark:text-gray-300">{m.session_incomplete_players()}</p>
            <ul class="list-disc ml-6 mb-4 text-sm dark:text-gray-300">
                {#each incompletePlayers as name}
                    <li>{name}</li>
                {/each}
            </ul>
            <div class="text-right">
                <Button onclick={() => (showModal = false)}>{m.session_okay()}</Button>
            </div>
        </div>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal title={m.session_delete()} bind:open={showDeleteModal} size="sm">
        <p class="text-gray-700 dark:text-gray-400 mb-6">
            {m.session_delete_confirm()}
        </p>
        <div class="flex justify-end space-x-2">
            <Button color="light" onclick={() => showDeleteModal = false}>{m.session_cancel()}</Button>
            <Button type="button" color="red" onclick={() => { handleDelete(); showDeleteModal = false; }}>{m.session_delete_button()}</Button>
        </div>
    </Modal>

    <!-- Add Player Modal -->
    <AddPlayerToSessionModal
        bind:open={showAddPlayerModal}
        sessionId={session.id}
        players={allPlayers}
        existingPlayerIds={existingPlayerIds}
        supabase={supabase}
    />

    <!-- Move Player Modal -->
    <MovePlayerToSessionModal
        bind:open={showMovePlayerModal}
        currentSessionId={session.id}
        players={formattedPlayers}
        supabase={supabase}
    />

    <!-- Remove Player Modal -->
    <RemovePlayerFromSessionModal
        bind:open={showRemovePlayerModal}
        players={formattedPlayers}
        supabase={supabase}
    />
</div>
