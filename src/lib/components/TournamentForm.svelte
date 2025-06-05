<script lang="ts">
    import { Alert, Button, Input, Label, Modal, Textarea } from 'flowbite-svelte';
    import { ArrowLeft, PlusIcon } from "lucide-svelte";
    import { superForm, type SuperValidated } from 'sveltekit-superforms';
    import type { TournamentSchema } from '$lib/schemas';
    import type { RatingClassDto } from '$lib/dto';
    import { m } from "$lib/paraglide/messages";

    // Props with proper typing
    let {
        formData,
        tournamentId = 0,
        ratingClasses
    }: {
        formData: SuperValidated<TournamentSchema>,
        tournamentId: number,
        ratingClasses: RatingClassDto[]
    } = $props();

    // Derived and state values
    let isEdit = $derived(tournamentId > 0);
    let addRatingClassIsOpen = $state(false);
    let newRatingClass = $state('');
    let addRatingClassError = $state(false);

    // Form handling
    const { form, errors, constraints, enhance, submitting, allErrors } = superForm(formData, {
        dataType: 'json'
    });

    let isFormValid = $derived($allErrors.length === 0)

    /**
     * Toggle a rating class selection
     */
    function toggleRatingClass(ratingClass: RatingClassDto) {
        const isSelected = $form.ratingClasses.some(c => c.name === ratingClass.name);

        if (isSelected) {
            $form.ratingClasses = $form.ratingClasses.filter(c => c.name !== ratingClass.name);
        } else {
            $form.ratingClasses = [...$form.ratingClasses, ratingClass];
        }
    }

    /**
     * Check if a rating class is selected
     */
    function isRatingClassSelected(ratingClass: RatingClassDto): boolean {
        return $form.ratingClasses.some(c => c.name === ratingClass.name);
    }

    /**
     * Open the modal to add a new rating class
     */
    function openAddRatingClassModal() {
        newRatingClass = '';
        addRatingClassError = false;
        addRatingClassIsOpen = true;
    }

    /**
     * Handle adding a new rating class
     */
    function handleAddRatingClass(event: SubmitEvent) {
        // Validate the new rating class
        const isEmpty = newRatingClass.trim() === '';
        const alreadyExists = ratingClasses.some(
            cls => cls.name.toLowerCase() === newRatingClass.toLowerCase()
        );

        if (isEmpty || alreadyExists) {
            addRatingClassError = true;
            event.preventDefault();
            return false;
        }

        // Add the new rating class
        addRatingClassError = false;
        ratingClasses = [...ratingClasses, { id: -1, name: newRatingClass.trim() }];
        addRatingClassIsOpen = false;
    }
</script>

<form
    method="POST"
    use:enhance
    class="max-w-xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow space-y-5"
>
    <a
        href={isEdit ? `/tournament/${tournamentId}` : '/tournament'}
        class="text-blue-600 hover:underline flex items-center gap-1"
        aria-label={isEdit ? m.tournament_form_back_to_tournament() : m.tournament_form_back_to_overview()}
    >
        <ArrowLeft class="w-4 h-4" aria-hidden="true" />
        {m.tournament_form_back()}
    </a>

    <div class="grid grid-cols-2 gap-4">
        <div class="grid col-span-2">
            <h2 class="text-2xl font-bold">
                {#if isEdit}{m.tournament_form_edit()}{:else}{m.tournament_form_create()}{/if}
            </h2>
        </div>

        <!-- Tournament Name -->
        <div class="grid col-span-2">
            <Label for="name">{m.tournament_form_name()}</Label>
            <Input
                id="name"
                name="name"
                bind:value={$form.name}
                {...$constraints.name}
                aria-required="true"
                aria-invalid={$errors.name ? 'true' : undefined}
                aria-describedby={$errors.name ? 'name-error' : undefined}
            />
            {#if $errors.name}
                <Alert color="red" id="name-error">{$errors.name}</Alert>
            {/if}
        </div>

        <!-- Start Date -->
        <div class="grid">
            <Label for="startDate">{m.tournament_form_start_date()}</Label>
            <Input
                id="startDate"
                name="startDate"
                type="date"
                bind:value={$form.startDate}
                {...$constraints.startDate}
                aria-required="true"
                aria-invalid={$errors.startDate ? 'true' : undefined}
                aria-describedby={$errors.startDate ? 'startDate-error' : undefined}
            />
            {#if $errors.startDate}
                <Alert color="red" id="startDate-error">{$errors.startDate}</Alert>
            {/if}
        </div>

        <!-- Start Time -->
        <div class="grid">
            <Label for="startTime">{m.tournament_form_start_time()}</Label>
            <Input
                id="startTime"
                name="startTime"
                type="time"
                bind:value={$form.startTime}
                {...$constraints.startTime}
                aria-required="true"
                aria-invalid={$errors.startTime ? 'true' : undefined}
                aria-describedby={$errors.startTime ? 'startTime-error' : undefined}
            />
            {#if $errors.startTime}
                <Alert color="red" id="startTime-error">{$errors.startTime}</Alert>
            {/if}
        </div>

        <!-- End Date -->
        <div>
            <Label for="endDate">{m.tournament_form_end_date()}</Label>
            <Input
                id="endDate"
                name="endDate"
                type="date"
                bind:value={$form.endDate}
                {...$constraints.endDate}
                aria-required="true"
                aria-invalid={$errors.endDate ? 'true' : undefined}
                aria-describedby={$errors.endDate ? 'endDate-error' : undefined}
            />
            {#if $errors.endDate}
                <Alert color="red" id="endDate-error">{$errors.endDate}</Alert>
            {/if}
        </div>

        <!-- End Time -->
        <div>
            <Label for="endTime">{m.tournament_form_end_time()}</Label>
            <Input
                id="endTime"
                name="endTime"
                type="time"
                bind:value={$form.endTime}
                {...$constraints.endTime}
                aria-required="true"
                aria-invalid={$errors.endTime ? 'true' : undefined}
                aria-describedby={$errors.endTime ? 'endTime-error' : undefined}
            />
            {#if $errors.endTime}
                <Alert color="red" id="endTime-error">{$errors.endTime}</Alert>
            {/if}
        </div>

        <!-- Minimum Participants -->
        <div>
            <Label for="minParticipants">{m.tournament_form_min_participants()}</Label>
            <Input
                id="minParticipants"
                name="minParticipants"
                type="number"
                bind:value={$form.minParticipants}
                {...$constraints.minParticipants}
                aria-required="true"
                aria-invalid={$errors.minParticipants ? 'true' : undefined}
                aria-describedby={$errors.minParticipants ? 'minParticipants-error' : undefined}
            />
            {#if $errors.minParticipants}
                <Alert color="red" id="minParticipants-error">{$errors.minParticipants}</Alert>
            {/if}
        </div>

        <!-- Hole Count -->
        <div>
            <Label for="holeCount">{m.tournament_form_hole_count()}</Label>
            <Input
                id="holeCount"
                name="holeCount"
                type="number"
                bind:value={$form.holeCount}
                {...$constraints.holeCount}
                aria-required="true"
                aria-invalid={$errors.holeCount ? 'true' : undefined}
                aria-describedby={$errors.holeCount ? 'holeCount-error' : undefined}
            />
            {#if $errors.holeCount}
                <Alert color="red" id="holeCount-error">{$errors.holeCount}</Alert>
            {/if}
        </div>

        <!-- Rating Classes -->
        <div class="grid col-span-2">
            <Label id="rating-classes-label">{m.tournament_form_rating_classes()}</Label>
            <div
                class="flex flex-wrap"
                role="group"
                aria-labelledby="rating-classes-label"
            >
                {#each ratingClasses as ratingClass}
                    <button
                        type="button"
                        class={`mx-1 my-2 px-3 py-1 rounded-full border ${
                            isRatingClassSelected(ratingClass)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600'
                        }`}
                        onclick={() => toggleRatingClass(ratingClass)}
                        aria-pressed={isRatingClassSelected(ratingClass)}
                    >
                        {ratingClass.name}
                    </button>
                {/each}
                <Button
                    type="button"
                    class="mx-1 my-2 px-3 py-1 rounded-full border"
                    onclick={openAddRatingClassModal}
                    aria-label={m.tournament_form_add_rating_class_aria()}
                >
                    <PlusIcon size="20" aria-hidden="true" />
                </Button>
            </div>
        </div>

        <!-- Description -->
        <div class="grid col-span-2">
            <Label for="description">{m.tournament_form_description()}</Label>
            <Textarea
                id="description"
                name="description"
                rows={4}
                bind:value={$form.description}
                {...$constraints.description}
                aria-invalid={$errors.description ? 'true' : undefined}
                aria-describedby={$errors.description ? 'description-error' : undefined}
            />
            {#if $errors.description}
                <Alert color="red" id="description-error">{$errors.description}</Alert>
            {/if}
        </div>

        <!-- Submit Button -->
        <div class="grid col-span-2">
            <Button type="submit" class="w-full"
                disabled={!isFormValid || $submitting}
                aria-disabled={!isFormValid || $submitting}>
                {isEdit ? m.tournament_form_save() : m.tournament_form_create_button()}
            </Button>
        </div>
    </div>
</form>

<!-- Add Rating Class Modal -->
<Modal
    title={m.tournament_form_add_rating_class_title()}
    bind:open={addRatingClassIsOpen}
    autoclose={false}
    class="overflow-hidden"
>
    <form
        method="dialog"
        class="flex flex-col space-y-6"
        onsubmit={handleAddRatingClass}
    >
        <Label for="ratingClassName">{m.tournament_form_rating_class_name()}</Label>
        <Input
            class="py-3"
            id="ratingClassName"
            bind:value={newRatingClass}
            required
            aria-invalid={addRatingClassError ? 'true' : undefined}
            aria-describedby={addRatingClassError ? 'rating-class-error' : undefined}
        />
        {#if addRatingClassError}
            <Alert color="red" id="rating-class-error">{m.tournament_form_rating_class_error()}</Alert>
        {/if}
        <Button class="py-3" type="submit">
            {m.tournament_form_add_button()}
        </Button>
    </form>
</Modal>
