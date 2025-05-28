<script lang="ts">
    import { Alert, Button, Input, Label, Modal, Textarea } from 'flowbite-svelte';
    import { ArrowLeft, PlusIcon } from "lucide-svelte";
    import SuperDebug, { superForm, type SuperValidated } from 'sveltekit-superforms';
    import type { TournamentSchema } from '$lib/schemas';
    import type { RatingClassDto } from '$lib/dto';

    let { formData, tournamentId = 0, ratingClasses }: {
        formData: SuperValidated<TournamentSchema>,
        tournamentId: number,
        ratingClasses: RatingClassDto[]
    } = $props();
    let isEdit = $derived(tournamentId > 0);
    let addRatingClassIsOpen = $state(false);
    let newRatingClass: string = $state('');
    let addRatingClassError = $state(false);

    const { form, errors, constraints, enhance } = superForm(formData, {
        dataType: 'json'
    });

    const toggleRatingClass = (ratingClass: RatingClassDto) => {
        if ($form.ratingClasses.findLast(c => c.name === ratingClass.name)) {
            $form.ratingClasses = $form.ratingClasses.filter((c) => c.name !== ratingClass.name);
        } else {
            $form.ratingClasses = [...$form.ratingClasses, ratingClass];
        }
    }

    const openAddRatingClassModal = () => {
        newRatingClass = '';
        addRatingClassError = false;
        addRatingClassIsOpen = true;
    }

    const handleAddRatingClass = (event: SubmitEvent) => {
        if (newRatingClass === ''
            || ratingClasses.findLast(cls => cls.name.toLowerCase() === newRatingClass.toLowerCase())) {
            addRatingClassError = true;
            event.preventDefault();
            return false;
        } else {
            addRatingClassError = false;
            ratingClasses = [...ratingClasses, { id: -1, name: newRatingClass }];
            addRatingClassIsOpen = false;
        }
    }
</script>


<form method="POST" use:enhance
      class="max-w-xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow space-y-5">
    <a href={isEdit ? `/tournament/${tournamentId}` : '/'}
       class="text-blue-600 hover:underline flex items-center gap-1">
        <ArrowLeft class="w-4 h-4"/>
        Zurück zur Ansicht
    </a>

    <div class="grid grid-cols-2 gap-4">

        <div class="grid col-span-2">
            <h2 class="text-2xl font-bold">
                {#if isEdit}Turnier bearbeiten{:else}Turnier erstellen{/if}
            </h2>
        </div>

        <div class="grid col-span-2">
            <Label for="name">Name</Label>
            <Input id="name" name="name" bind:value={$form.name} {...$constraints.name}/>
            {#if $errors.name}
                <Alert color="red">{$errors.name}</Alert>
            {/if}
        </div>

        <div class="grid">
            <Label for="startDate">Startdatum</Label>
            <Input id="startDate" name="startDate" type="date" bind:value={$form.startDate}
                   {...$constraints.startDate}/>
            {#if $errors.startDate}
                <Alert color="red">{$errors.startDate}</Alert>
            {/if}
        </div>

        <div class="grid">
            <Label for="startTime">Startzeit</Label>
            <Input id="startTime" name="startTime" type="time" bind:value={$form.startTime}
                   {...$constraints.startTime}/>
            {#if $errors.startTime}
                <Alert color="red">{$errors.startTime}</Alert>
            {/if}
        </div>
        <div>
            <Label for="endDate">Enddatum</Label>
            <Input id="endDate" name="endDate" type="date" bind:value={$form.endDate} {...$constraints.endDate}/>
            {#if $errors.endDate}
                <Alert color="red">{$errors.endDate}</Alert>
            {/if}
        </div>
        <div>
            <Label for="endTime">Endzeit</Label>
            <Input id="endTime" name="endTime" type="time" bind:value={$form.endTime} {...$constraints.endTime}/>
            {#if $errors.endTime}
                <Alert color="red">{$errors.endTime}</Alert>
            {/if}
        </div>

        <div>
            <Label for="minParticipants">Minimale Teilnehmer pro Runde</Label>
            <Input id="minParticipants" name="minParticipants" type="number" bind:value={$form.minParticipants}
                   {...$constraints.minParticipants}/>
            {#if $errors.minParticipants}
                <Alert color="red">{$errors.minParticipants}</Alert>
            {/if}
        </div>
        <div>
            <Label for="holeCount">Lochanzahl</Label>
            <Input id="holeCount" name="holeCount" type="number" bind:value={$form.holeCount}
                   {...$constraints.holeCount}/>
            {#if $errors.holeCount}
                <Alert color="red">{$errors.holeCount}</Alert>
            {/if}
        </div>

        <div class="grid col-span-2">
            <Label>Wertungsklassen</Label>
            <div class="flex flex-wrap">
                {#each ratingClasses as ratingClass}
                    <button
                            type="button"
                            class={`mx-1 my-2 px-3 py-1 rounded-full border ${
                            $form.ratingClasses.findLast(c => c.name === ratingClass.name)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                            onclick={() => toggleRatingClass(ratingClass)}
                    >
                        {ratingClass.name}
                    </button>
                {/each}
                <Button type="button" class="mx-1 my-2 px-3 py-1 rounded-full border"
                        onclick={openAddRatingClassModal}>
                    <PlusIcon size="20"/>
                </Button>
            </div>
        </div>

        <div class="grid col-span-2">
            <Label for="description">Beschreibung</Label>
            <Textarea id="description" name="description" rows={4} bind:value={$form.description}
                      {...$constraints.description}/>
            {#if $errors.description}
                <Alert color="red">{$errors.description}</Alert>
            {/if}
        </div>

        <div class="grid col-span-2">
            <Button type="submit" class="w-full">
                Absenden
            </Button>
        </div>
    </div>
</form>

<Modal
        title="Wertungsklasse hinzufügen."
        bind:open={addRatingClassIsOpen}
>
    <form method="dialog" class="flex flex-col space-y-6" onsubmit={handleAddRatingClass}>
        <Label for="ratingClassName">Name</Label>
        <Input class="py-3" id="ratingClassName" bind:value={newRatingClass} required/>
        {#if addRatingClassError}
            <Alert color="red">Wertungsklasse existiert bereits.</Alert>
        {/if}
        <Button class="py-3" type="submit">
            Hinzufügen
        </Button>
    </form>
</Modal>
