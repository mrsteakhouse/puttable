<script lang="ts">
    import {
        Alert,
        Button,
        Card,
        Input,
        Label,
        Modal,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell
    } from 'flowbite-svelte';
    import { ArrowLeft, Check, Pencil, Trash, X } from 'lucide-svelte';
    import type { PageProps } from './$types';
    import { superForm } from 'sveltekit-superforms';
    import type { PlayerFormSchema } from '$lib/schemas';
    import PermissionGuard from '$lib/components/PermissionGuard.svelte';
    import { Action, Resource } from '$lib/permissions';

    let { data }: PageProps = $props();
    let isEditing = $state(false);
    let showDeleteModal = $state(false);
    let deleteForm: HTMLFormElement;

    // Function to open delete confirmation modal
    function openDeleteModal() {
        showDeleteModal = true;
    }

    // Function to handle player deletion
    function handleDelete() {
        if (deleteForm) {
            deleteForm.submit();
        }
    }

    // Initialize the form
    const { form, errors, enhance, submitting } = superForm<PlayerFormSchema>(data.form, {
        dataType: 'json',
        onResult: ({ result }) => {
            if (result.type === 'success') {
                // Exit edit mode on success
                isEditing = false;
            }
        }
    });

    // Toggle edit mode
    function toggleEdit() {
        isEditing = !isEditing;
    }

    // Cancel editing
    function cancelEdit() {
        // Reset form to original values
        $form.firstName = data.player.firstname;
        $form.lastName = data.player.lastname;
        $form.ratingClassId = data.player.rating_class_id;
        isEditing = false;
    }
</script>

<div class="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow" role="main">
    <div class="mb-6">
        <a href="/player" class="text-blue-600 hover:underline flex items-center gap-1" aria-label="Zurück zur Spielerliste">
            <ArrowLeft class="w-4 h-4" aria-hidden="true"/>
            Zurück zur Spielerliste
        </a>
    </div>

    <div class="mb-6">
        <div class="flex justify-between items-start">
            <div class="flex-grow">
                {#if isEditing}
                    <form method="POST" action="?/updatePlayer" use:enhance class="space-y-4" aria-labelledby="edit-player-heading">
                        <h2 id="edit-player-heading" class="sr-only">Spieler bearbeiten</h2>
                        <div class="mb-4">
                            <Label for="firstName">Vorname</Label>
                            <Input
                                id="firstName"
                                name="firstName"
                                bind:value={$form.firstName}
                                aria-required="true"
                                aria-invalid={$errors.firstName ? 'true' : undefined}
                                aria-describedby={$errors.firstName ? 'firstName-error' : undefined}
                            />
                            {#if $errors.firstName}
                                <Alert color="red" class="mt-1" id="firstName-error">{$errors.firstName}</Alert>
                            {/if}
                        </div>

                        <div class="mb-4">
                            <Label for="lastName">Nachname</Label>
                            <Input
                                id="lastName"
                                name="lastName"
                                bind:value={$form.lastName}
                                aria-required="true"
                                aria-invalid={$errors.lastName ? 'true' : undefined}
                                aria-describedby={$errors.lastName ? 'lastName-error' : undefined}
                            />
                            {#if $errors.lastName}
                                <Alert color="red" class="mt-1" id="lastName-error">{$errors.lastName}</Alert>
                            {/if}
                        </div>

                        <div class="mb-4">
                            <Label for="ratingClassId">Wertungsklasse</Label>
                            <select
                                id="ratingClassId"
                                name="ratingClassId"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                bind:value={$form.ratingClassId}
                                aria-required="true"
                                aria-invalid={$errors.ratingClassId ? 'true' : undefined}
                                aria-describedby={$errors.ratingClassId ? 'ratingClassId-error' : undefined}
                            >
                                <option value="">Wertungsklasse auswählen</option>
                                {#each data.ratingClasses as ratingClass}
                                    <option value={ratingClass.id}>{ratingClass.name}</option>
                                {/each}
                            </select>
                            {#if $errors.ratingClassId}
                                <Alert color="red" class="mt-1" id="ratingClassId-error">{$errors.ratingClassId}</Alert>
                            {/if}
                        </div>

                        <div class="flex space-x-2">
                            <Button
                                type="submit"
                                color="green"
                                disabled={$submitting}
                                aria-disabled={$submitting}
                                aria-label="Änderungen speichern"
                            >
                                <Check class="w-4 h-4 mr-1" aria-hidden="true" />
                                Speichern
                            </Button>
                            <Button
                                type="button"
                                color="light"
                                onclick={cancelEdit}
                                aria-label="Bearbeitung abbrechen"
                            >
                                <X class="w-4 h-4 mr-1" aria-hidden="true" />
                                Abbrechen
                            </Button>
                        </div>
                    </form>
                {:else}
                    <h1 id="player-name" class="text-2xl font-bold">{data.player.firstname} {data.player.lastname}</h1>
                    <p class="text-gray-600 dark:text-gray-400">Wertungsklasse: {data.player.rating_classes?.name || 'Keine'}</p>
                {/if}
            </div>

            {#if !isEditing}
                <div class="flex space-x-2" role="toolbar" aria-label="Spieler-Aktionen">
                    <PermissionGuard supabase={data.supabase} resource={Resource.Players} action={Action.Update}>
                        <Button
                            color="light"
                            size="sm"
                            onclick={toggleEdit}
                            aria-label="Spieler bearbeiten"
                        >
                            <Pencil class="w-4 h-4" aria-hidden="true"/>
                        </Button>
                    </PermissionGuard>
                    <PermissionGuard supabase={data.supabase} resource={Resource.Players} action={Action.Delete}>
                        <Button
                            color="red"
                            size="sm"
                            onclick={openDeleteModal}
                            aria-label="Spieler löschen"
                        >
                            <Trash class="w-4 h-4" aria-hidden="true"/>
                        </Button>
                    </PermissionGuard>
                </div>
            {/if}
        </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6" role="region" aria-label="Spielerstatistiken">
        <Card class="p-3">
            <h5 id="avg-score-heading" class="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Durchschnittliche Punktzahl
            </h5>
            <p class="mb-3 font-normal text-gray-700 dark:text-gray-400 leading-tight" aria-labelledby="avg-score-heading">
                <span class="text-4xl font-bold text-blue-600">{data.statistics.averageScore}</span>
                <br>
                <span class="text-sm">basierend auf {data.statistics.totalHolesPlayed} gespielten Löchern</span>
            </p>
        </Card>

        <Card class="p-3">
            <h5 id="ones-rate-heading" class="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Einsen Rate
            </h5>
            <p class="mb-3 font-normal text-gray-700 dark:text-gray-400 leading-tight" aria-labelledby="ones-rate-heading">
                <span class="text-4xl font-bold text-green-600">{data.statistics.onesRate}%</span>
                <br>
                <span class="text-sm">{data.statistics.totalOnes} Einsen in {data.statistics.totalHolesPlayed} Löchern</span>
            </p>
        </Card>

        <Card class="p-3">
            <h5 id="avg-scorecard-heading" class="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Durchschnitt pro Scorecard
            </h5>
            <p class="mb-3 font-normal text-gray-700 dark:text-gray-400 leading-tight" aria-labelledby="avg-scorecard-heading">
                <span class="text-4xl font-bold text-purple-600">{data.statistics.averageScorePerScorecard}</span>
                <br>
                <span class="text-sm">basierend auf {data.statistics.validScorecards} Scorecards</span>
            </p>
        </Card>
    </div>

    {#if data.statistics.totalHolesPlayed === 0}
        <Alert class="mt-6" role="alert">
            Keine Spielstatistiken verfügbar. Der Spieler hat noch keine Scorecards.
        </Alert>
    {/if}

    <!-- Sessions Overview -->
    <div class="mt-8" role="region" aria-labelledby="sessions-heading">
        <h2 id="sessions-heading" class="text-xl font-bold mb-4">Gespielte Sessions</h2>

        {#if data.sessions && data.sessions.length > 0}
            <Table striped={true} aria-labelledby="sessions-heading">
                <caption class="sr-only">Liste der gespielten Sessions von {data.player.firstname} {data.player.lastname}</caption>
                <TableHead>
                    <TableHeadCell>Datum</TableHeadCell>
                    <TableHeadCell>Turnier</TableHeadCell>
                    <TableHeadCell>Löcher</TableHeadCell>
                    <TableHeadCell>Ergebnis</TableHeadCell>
                    <TableHeadCell>Aktionen</TableHeadCell>
                </TableHead>
                <TableBody>
                    {#each data.sessions as session}
                        {@const playerScorecard = session.scorecard.find(sc => sc.player.id === data.player.id)}
                        {@const totalScore = playerScorecard ? playerScorecard.data.reduce((sum, score) => sum + (score || 0), 0) : 0}
                        <TableBodyRow>
                            <TableBodyCell>
                                {#if session.submissionDateTime}
                                    {new Date(session.submissionDateTime).toLocaleDateString('de-DE')}
                                {:else}
                                    -
                                {/if}
                            </TableBodyCell>
                            <TableBodyCell>{session.tournamentName}</TableBodyCell>
                            <TableBodyCell>{session.holes}</TableBodyCell>
                            <TableBodyCell>{totalScore}</TableBodyCell>
                            <TableBodyCell>
                                <a href="/session/{session.id}" class="text-blue-600 hover:underline" aria-label="Details zur Session #{session.id} anzeigen">
                                    Details
                                </a>
                            </TableBodyCell>
                        </TableBodyRow>
                    {/each}
                </TableBody>
            </Table>
        {:else}
            <Alert role="alert">
                Der Spieler hat noch keine Löcher gespielt.
            </Alert>
        {/if}
    </div>
</div>

<!-- Delete Confirmation Modal -->
<Modal
    title="Spieler löschen"
    bind:open={showDeleteModal}
    size="sm"
    aria-labelledby="delete-player-modal-title"
    aria-describedby="delete-player-modal-description"
>
    <h2 id="delete-player-modal-title" class="sr-only">Spieler löschen</h2>
    <p id="delete-player-modal-description" class="text-gray-700 dark:text-gray-400 mb-6">
        Möchten Sie den Spieler "{data.player.firstname} {data.player.lastname}" wirklich löschen?
    </p>
    <div class="flex justify-end space-x-2">
        <Button
            color="light"
            onclick={() => showDeleteModal = false}
            aria-label="Abbrechen und Modal schließen"
        >
            Abbrechen
        </Button>
        <form method="POST" action="?/deletePlayer" bind:this={deleteForm}>
            <Button
                type="button"
                color="red"
                onclick={() => { handleDelete(); showDeleteModal = false; }}
                aria-label="Spieler endgültig löschen"
            >
                Löschen
            </Button>
        </form>
    </div>
</Modal>
