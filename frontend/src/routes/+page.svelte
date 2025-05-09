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

    let searchTerm = $state("");
    let items = $state([
        {
            id: 1,
            name: "Tournament #1",
            date: new Date(2023, 2, 1).toLocaleDateString(),
            participants: 12
        },
        {
            id: 5,
            name: "asdf",
            date: new Date(2022, 1, 2).toLocaleDateString(),
            participants: 4
        },
        {
            id: 2,
            name: "Tournament 123",
            date: new Date(2026, 4, 5).toLocaleDateString(),
            participants: 1
        }
    ])
    let filteredItems = $derived(items.filter((item) =>
        !searchTerm
        || fuzzysearch(searchTerm.toLowerCase(), item.name.toLowerCase())));
</script>

<Button
        href="/tournament/new"
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
