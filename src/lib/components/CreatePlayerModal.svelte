<script lang="ts">
    import { Alert, Button, Input, Label, Modal, Select } from 'flowbite-svelte';
    import { superForm, type SuperValidated } from 'sveltekit-superforms';
    import type { RatingClassDto } from '$lib/dto';
    import type { PlayerFormSchema } from '$lib/schemas';
    import { m } from "$lib/paraglide/messages";

    // Props
    let {
        open = $bindable(false),
        ratingClasses = [],
        form,
        onPlayerCreated = (_player) => {}
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

    // Initialize rating class ID to default value
    $formData.ratingClassId = -1;

    // Close the modal
    function closeModal() {
        open = false;
    }

    // Handle form submission result
    function handleResult({ result }: { result: { type: string, data?: { player?: { id: number, firstName: string, lastName: string } } } }) {
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

<Modal title={m.create_player_modal_title()} bind:open={open} size="md" class="overflow-hidden" autoclose={false}>
    <form method="POST" action="?/createPlayer" use:enhance class="space-y-4">
        <div>
            <Label for="firstName">{m.create_player_modal_first_name()}</Label>
            <Input
                id="firstName"
                name="firstName"
                bind:value={$formData.firstName}
                {...$constraints.firstName}
                aria-required="true"
                aria-invalid={$errors.firstName ? 'true' : undefined}
                aria-describedby={$errors.firstName ? 'firstName-error' : undefined}
            />
            {#if $errors.firstName}
                <Alert color="red" class="mt-1" id="firstName-error">{$errors.firstName}</Alert>
            {/if}
        </div>

        <div>
            <Label for="lastName">{m.create_player_modal_last_name()}</Label>
            <Input
                id="lastName"
                name="lastName"
                bind:value={$formData.lastName}
                {...$constraints.lastName}
                aria-required="true"
                aria-invalid={$errors.lastName ? 'true' : undefined}
                aria-describedby={$errors.lastName ? 'lastName-error' : undefined}
            />
            {#if $errors.lastName}
                <Alert color="red" class="mt-1" id="lastName-error">{$errors.lastName}</Alert>
            {/if}
        </div>

        <div>
            <Label for="ratingClassId">{m.create_player_modal_rating_class()}</Label>
            <Select
                id="ratingClassId"
                name="ratingClassId"
                bind:value={$formData.ratingClassId}
                aria-required="true"
                aria-invalid={$errors.ratingClassId ? 'true' : undefined}
                aria-describedby={$errors.ratingClassId ? 'ratingClassId-error' : undefined}
                placeholder=""
            >
                <option selected value={-1} disabled>{m.create_player_modal_select_rating_class()}</option>
                {#each ratingClasses as ratingClass}
                    <option value={ratingClass.id}>{ratingClass.name}</option>
                {/each}
            </Select>
            {#if $errors.ratingClassId}
                <Alert color="red" class="mt-1" id="ratingClassId-error">{$errors.ratingClassId}</Alert>
            {/if}
        </div>

        <div class="flex justify-end space-x-2 pt-4">
            <Button type="button" color="light" onclick={closeModal}>{m.create_player_modal_cancel()}</Button>
            <Button type="submit" color="blue">{m.create_player_modal_save()}</Button>
        </div>
    </form>
</Modal>
