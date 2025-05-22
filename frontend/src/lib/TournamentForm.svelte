<script lang="ts">
    import { Alert, Button, Input, Label, Textarea } from 'flowbite-svelte';
    import { ArrowLeft } from "lucide-svelte";
    import { type Infer, superForm, type SuperValidated } from 'sveltekit-superforms';
    import type { TournamentSchema } from '$lib/schemas';

    let { formData, tournamentId = 0 }: { formData: SuperValidated<TournamentSchema>, tournamentId: number } = $props();
    let isEdit = $derived(tournamentId > 0);

    const { form, errors, constraints, enhance } = superForm(formData);
</script>


<form method="POST" use:enhance
      class="max-w-xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow space-y-5">
    <a href={isEdit ? `/tournament/${tournamentId}` : '/'}
       class="text-blue-600 hover:underline flex items-center gap-1">
            <ArrowLeft class="w-4 h-4"/>
            Zurück zur Ansicht
        </a>

    <h2 class="text-2xl font-bold">
        {#if isEdit}Turnier bearbeiten{:else}Turnier erstellen{/if}
    </h2>

    <div>
        <Label for="name">Name</Label>
        <Input id="name" name="name" bind:value={$form.name} {...$constraints.name}/>
        {#if $errors.name}
            <Alert color="red">{$errors.name}</Alert>
        {/if}
    </div>

    <div class="grid grid-cols-2 gap-4">
        <div>
            <Label for="startDate">Startdatum</Label>
            <Input id="startDate" name="startDate" type="date" bind:value={$form.startDate}
                   {...$constraints.startDate}/>
            {#if $errors.startDate}
                <Alert color="red">{$errors.startDate}</Alert>
            {/if}
        </div>
        <div>
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
    </div>

    <div class="grid grid-cols-2 gap-4">
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
    </div>

    <div>
        <Label for="description">Beschreibung</Label>
        <Textarea id="description" name="description" rows={4} bind:value={$form.description}
                  {...$constraints.description}/>
        {#if $errors.description}
            <Alert color="red">{$errors.description}</Alert>
        {/if}
    </div>

    <Button type="submit" class="w-full">
        Absenden
    </Button>
</form>
