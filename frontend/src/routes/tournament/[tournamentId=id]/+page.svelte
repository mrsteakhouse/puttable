<script lang="ts">
    import type {PageProps} from "./$types";
    import DetailHeader from "$lib/DetailHeader.svelte";
    import {Button, Hr, Label, Tooltip} from "flowbite-svelte";
    import {marked} from "marked";
    import moment from "moment";
    import {goto} from "$app/navigation";

    let  { data }: PageProps = $props();

    let allowStartSession = moment().isBetween(
        data.tournament.startDateTime,
        data.tournament.endDateTime
    );
</script>


<DetailHeader heading={data.tournament.name} editLink="/tournament/edit/{data.tournament.id}"/>

<div class="grid grid-cols-2 gap-4 xl:px-150">
    <div>
        <Label class="text-xl space-y-2">
            <span>Rules</span>
        </Label>
    </div>
    <div>
        {@html marked(data.tournament.description)}
    </div>
    <Hr class="col-span-2 my-2"></Hr>
    <div>
        <Label class="text-xl space-y-2">
            <span>Start</span>
        </Label>
    </div>
    <div>
        {moment(data.tournament.startDateTime).format("kk:mm DD.MM.YYYY")}
    </div>
    <Hr class="col-span-2 my-2"></Hr>
    <div>
        <Label class="text-xl space-y-2">
            <span>End</span>
        </Label>
    </div>
    <div>
        {moment(data.tournament.endDateTime).format("kk:mm DD.MM.YYYY")}
    </div>
    <Hr class="col-span-2 my-2"></Hr>
    <div>
        <Label class="text-xl space-y-2">
            <span>Number of Holes</span>
        </Label>
    </div>
    <div>
        {data.tournament.numberOfHoles}
    </div>
    <Hr class="col-span-2 my-2"></Hr>
    <div>
        <Label class="text-xl space-y-2">
            <span>Minimum number of competitors</span>
        </Label>
    </div>
    <div>
        {data.tournament.minimumCompetitorsPerSession}
    </div>
    <Hr class="col-span-2 my-2"></Hr>
</div>

<div class="flex justify-center pt-10">
    <Button id="start-new-session-button" onclick={() => goto("/session/create")} disabled={!allowStartSession}>Start new Session</Button>
    {#if !allowStartSession}
        <Tooltip triggeredBy="#start-new-session-button" placement="bottom">
            {#if moment().isBefore(data.tournament.startDateTime)}
                The Tournament has not began yet.
            {:else if moment().isAfter(data.tournament.endDateTime)}
                The Tournament is already finished.
            {/if}
        </Tooltip>
    {/if}
</div>