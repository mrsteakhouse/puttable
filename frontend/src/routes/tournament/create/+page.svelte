<script lang="ts">
    import {createForm} from 'felte';
    import {validator} from '@felte/validator-zod';
    import {z} from 'zod';
    import {Alert, Button, Input, Label, Textarea} from 'flowbite-svelte';

    const schema = z.object({
        name: z.string().min(1, 'Name ist erforderlich'),
        startDate: z.string().min(1, 'Startdatum ist erforderlich'),
        startTime: z.string().min(1, 'Startzeit ist erforderlich'),
        endDate: z.string().min(1, 'Enddatum ist erforderlich'),
        endTime: z.string().min(1, 'Endzeit ist erforderlich'),
        minParticipants: z.number().min(1, 'Mindestens 1 Teilnehmer'),
        holeCount: z.number().min(1, 'Mindestens 1 Loch.'),
        description: z.string().optional()
    });

    const {form, data, errors, isSubmitting} = createForm({
        initialValues: {
            name: '',
            startDate: '',
            startTime: '',
            endDate: '',
            endTime: '',
            minParticipants: 1,
            holeCount: 18,
            description: ''
        },
        onSubmit: (values) => {
            const start = `${values.startDate}T${values.startTime}`;
            const end = `${values.endDate}T${values.endTime}`;
            console.log({...values, start, end});
            alert('Formular erfolgreich übermittelt!');
        },
        extend: validator({schema})
    });
</script>

<form use:form class="max-w-xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow space-y-5">
    <h2 class="text-2xl font-bold">Turnier erstellen</h2>

    <div>
        <Label for="name">Name</Label>
        <Input id="name" name="name"/>
        {#if $errors.name}
            <Alert color="red">{$errors.name}</Alert>
        {/if}
    </div>

    <div class="grid grid-cols-2 gap-4">
        <div>
            <Label for="startDate">Startdatum</Label>
            <Input id="startDate" name="startDate" type="date"/>
            {#if $errors.startDate}
                <Alert color="red">{$errors.startDate}</Alert>
            {/if}
        </div>
        <div>
            <Label for="startTime">Startzeit</Label>
            <Input id="startTime" name="startTime" type="time"/>
            {#if $errors.startTime}
                <Alert color="red">{$errors.startTime}</Alert>
            {/if}
        </div>
        <div>
            <Label for="endDate">Enddatum</Label>
            <Input id="endDate" name="endDate" type="date"/>
            {#if $errors.endDate}
                <Alert color="red">{$errors.endDate}</Alert>
            {/if}
        </div>
        <div>
            <Label for="endTime">Endzeit</Label>
            <Input id="endTime" name="endTime" type="time"/>
            {#if $errors.endTime}
                <Alert color="red">{$errors.endTime}</Alert>
            {/if}
        </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
        <div>
            <Label for="minParticipants">Minimale Teilnehmer pro Runde</Label>
            <Input id="minParticipants" name="minParticipants" type="number" min="1"/>
            {#if $errors.minParticipants}
                <Alert color="red">{$errors.minParticipants}</Alert>
            {/if}
        </div>
        <div>
            <Label for="holeCount">Lochanzahl</Label>
            <Input id="holeCount" name="holeCount" type="number" min="1" max="18"/>
            {#if $errors.holeCount}
                <Alert color="red">{$errors.holeCount}</Alert>
            {/if}
        </div>
    </div>

    <div>
        <Label for="description">Beschreibung</Label>
        <Textarea id="description" name="description" rows={4}/>
        {#if $errors.description}
            <Alert color="red">{$errors.description}</Alert>
        {/if}
    </div>

    <Button type="submit" class="w-full" disabled={$isSubmitting}>
        {#if $isSubmitting}Wird gesendet...{:else}Absenden{/if}
    </Button>
</form>
