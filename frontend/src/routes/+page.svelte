<script lang="ts">
    import {
        Button,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
        TableSearch
    } from "flowbite-svelte";
    import {CirclePlusSolid} from "flowbite-svelte-icons"
    import fuzzysearch from "fuzzysearch-ts";
    import {goto} from "$app/navigation";
    import type {PageProps} from "./$types";

    let {data}: PageProps = $props();
    let items = $state(data.tournaments)
    let searchTerm = $state("");
    let filteredItems = $derived(data.tournaments.filter((item) =>
        !searchTerm
        || fuzzysearch(searchTerm.toLowerCase(), item.name.toLowerCase())));
</script>

<Button
        href="/tournament/edit"
        outline
        class="me-2 w-50 h-12"
        size="lg"
>
    <CirclePlusSolid class="me-2"/>
    Add Tournament
</Button>

<TableSearch hoverable placeholder="Search by name" bind:inputValue={searchTerm}>
    <TableHead>
        <TableHeadCell sort={(a, b) => a.name.localeCompare(b.name)}>Name</TableHeadCell>
        <TableHeadCell>Participants</TableHeadCell>
        <TableHeadCell sort={(a, b) => a.date.localeCompare(b.date)} defaultSort>Date</TableHeadCell>
    </TableHead>
    <TableBody>
        {#each filteredItems as item}
            <TableBodyRow
                    onclick={() => {goto(`/tournament/${item.id}`)}}
                    class="cursor-pointer">
                <TableBodyCell>{item.name}</TableBodyCell>
                <TableBodyCell>{item.participants}</TableBodyCell>
                <TableBodyCell>{item.date}</TableBodyCell>
            </TableBodyRow>
        {/each}
    </TableBody>
</TableSearch>
