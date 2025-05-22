<script lang="ts">
    import {createForm} from 'felte';
    import {validator} from '@felte/validator-zod';
    import {z} from 'zod';
    import {Alert, Button, Input, Label, Textarea} from 'flowbite-svelte';
    import moment from "moment";
    import {ArrowLeft} from "lucide-svelte";
    import {DATETIME_WITH_TIMEZONE} from "$lib/constants";
    import {supabase} from "$lib/supabase";
    import {goto} from "$app/navigation";

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

    let {
        tournamentData = {
            id: 0,
            name: '',
            startDateTime: 0,
            endDateTime: 0,
            minimumCompetitorsPerSession: 1,
            numberOfHoles: 18,
            description: ''
        },
        isEdit = false,
    } = $props();

    let initialValues = $derived({
        name: tournamentData.name,
        startDate: tournamentData.startDateTime > 0 ? moment(tournamentData.startDateTime).format("YYYY-MM-DD") : '',
        startTime: tournamentData.startDateTime > 0 ? moment(tournamentData.startDateTime).format("HH:mm") : '',
        endDate: tournamentData.startDateTime > 0 ? moment(tournamentData.endDateTime).format("YYYY-MM-DD") : '',
        endTime: tournamentData.startDateTime > 0 ? moment(tournamentData.endDateTime).format("HH:mm") : '',
        minParticipants: tournamentData.minimumCompetitorsPerSession,
        holeCount: tournamentData.numberOfHoles,
        description: tournamentData.description
    });

    const {form, errors, isSubmitting} = createForm({
        initialValues,
        onSubmit: async (values) => {
            const startDateTime = moment(`${values.startDate}T${values.startTime}}`).format(DATETIME_WITH_TIMEZONE);
            const endDateTime = moment(`${values.endDate}T${values.endTime}}`).format(DATETIME_WITH_TIMEZONE);
            const dbData = {
                name: values.name,
                start_date: startDateTime,
                end_date: endDateTime,
                number_of_holes: values.holeCount,
                minimum_participants: values.minParticipants,
                description: values.description
            };
            let result;

            if (isEdit) {
                result = await supabase
                    .from('tournaments')
                    .update(dbData)
                    .eq('id', 1)
            } else {
                result = await supabase
                    .from('tournaments')
                    .insert(dbData);
            }

            if (result.error) {
                alert(result.error.details)
            } else {
                await goto('/tournament/1');
            }
        },
        extend: validator({schema})
    });
</script>


<form use:form class="max-w-xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow space-y-5">
    {#if isEdit}
        <a href={`/tournament/${tournamentData.id}`} class="text-blue-600 hover:underline flex items-center gap-1">
            <ArrowLeft class="w-4 h-4"/>
            Zurück zur Ansicht
        </a>
    {/if}

    <h2 class="text-2xl font-bold">
        {#if isEdit}Turnier bearbeiten{:else}Turnier erstellen{/if}
    </h2>

    <input name="id" id="id" hidden={true} value={tournamentData.id}>

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
