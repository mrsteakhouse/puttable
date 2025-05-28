<script lang="ts">
    import { Alert, Button, Input, Label, Modal } from 'flowbite-svelte';
    import { superForm, type SuperForm, type SuperValidated } from 'sveltekit-superforms';
    import type { RatingClassDto } from '$lib/dto';
    import { createEventDispatcher } from 'svelte';
    import type { PlayerFormSchema } from '../../routes/player/+page.server';

    // Props
    let {
        open = $bindable(false),
        ratingClasses = [],
        form,
        onPlayerCreated = (_) => {}
    }: {
        open: boolean,
        ratingClasses: RatingClassDto[],
        form: SuperValidated<PlayerFormSchema>,
        onPlayerCreated: (player: { id: number, firstName: string, lastName: string }) => void
    } = $props();

    // Form handling
    const { form: formData, errors, constraints, enhance, reset } = superForm<PlayerFormSchema>(form, {
        dataType: 'json',
        onResult: handleResult
    });

    // Close the modal
    function closeModal() {
        open = false;
    }

    // Handle form submission result
    function handleResult({ result }: { result: { type: string, data?: any } }) {
        if (result.type === 'success' && result.data?.player) {
            // Reset the form
            reset();

            // Notify parent that a player was created
            onPlayerCreated(result.data.player);

            // Close the modal
            closeModal();
        }
    }
</script>

<Modal title="Spieler anlegen" bind:open={open} size="md">
    <form method="POST" action="?/createPlayer" use:enhance class="space-y-4">
        <div>
            <Label for="firstName">Vorname</Label>
            <Input id="firstName" name="firstName" bind:value={$formData.firstName} {...$constraints.firstName} />
            {#if $errors.firstName}
                <Alert color="red" class="mt-1">{$errors.firstName}</Alert>
            {/if}
        </div>

        <div>
            <Label for="lastName">Nachname</Label>
            <Input id="lastName" name="lastName" bind:value={$formData.lastName} {...$constraints.lastName} />
            {#if $errors.lastName}
                <Alert color="red" class="mt-1">{$errors.lastName}</Alert>
            {/if}
        </div>

        <div>
            <Label for="ratingClassId">Wertungsklasse</Label>
            <select
                id="ratingClassId"
                name="ratingClassId"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                bind:value={$formData.ratingClassId}
            >
                <option value="">Wertungsklasse auswählen</option>
                {#each ratingClasses as ratingClass}
                    <option value={ratingClass.id}>{ratingClass.name}</option>
                {/each}
            </select>
            {#if $errors.ratingClassId}
                <Alert color="red" class="mt-1">{$errors.ratingClassId}</Alert>
            {/if}
        </div>

        <div class="flex justify-end space-x-2 pt-4">
            <Button type="button" color="light" onclick={closeModal}>Abbrechen</Button>
            <Button type="submit" color="blue">Speichern</Button>
        </div>
    </form>
</Modal>
