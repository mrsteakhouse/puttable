<script lang="ts">
    import type {PageProps} from "./$types";
    import DetailHeader from "$lib/DetailHeader.svelte";
    import {Button, Label, Hr} from "flowbite-svelte";
    import { marked } from "marked";
    import moment from "moment";

    let  { data }: PageProps = $props();


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
        {new Date(data.tournament.endDateTime).toLocaleString()}
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
    <Button href="/session/create">Start new Session</Button>
</div>
