<script lang="ts">
    import { Alert, Button, Input, Label, Modal, Select } from 'flowbite-svelte';
    import { superForm, type SuperValidated } from 'sveltekit-superforms';
    import type { RatingClassDto } from '$lib/dto';
    import type { PlayerFormSchema } from '$lib/schemas';

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

    let selectItems = $derived(ratingClasses.map(ratingClass => {
        return {
            value: ratingClass.id,
            name: ratingClass.name
        }
    }))

    // Form handling
    const { form: formData, errors, constraints, enhance, reset } = superForm<PlayerFormSchema>(form, {
        dataType: 'json',
        onResult: handleResult
    });

    $formData.ratingClassId = -1;

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
            <Select
                id="ratingClassId"
                name="ratingClassId"
                bind:value={$formData.ratingClassId}
                placeholder=""
            >
                <option selected value={-1} disabled>Wertungsklasse auswählen</option>
                {#each ratingClasses as ratingClass}
                    <option value={ratingClass.id}>{ratingClass.name}</option>
                {/each}
            </Select>
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
