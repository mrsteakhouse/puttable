+page.svelte<script lang="ts">
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

    let searchTerm = $state("");
    let player = $state([
        {
            id: 1,
            name: "Donald Duck",
        },
        {
            id: 5,
            name: "Evil Knevil",
        },
        {
            id: 2,
            name: "Mickey Mouse",
        }
    ])
    let filteredItems = $derived(player.filter((item) =>
        !searchTerm
        || fuzzysearch(searchTerm.toLowerCase(), item.name.toLowerCase())));
</script>

<Button
        outline
        class="me-2 w-50 h-12"
        size="lg"
>
    <CirclePlusSolid class="me-2"/>
    Add Tournament
</Button>

<div class="grid grid-cols-9 pt-5 px-10 gap-4">
    {#each filteredItems as item}
        <div class="col-span-6">{item.name}</div>
        <div class="col-span-1">
            <a href="/player/statistics?id={item.id}">Statistics</a>
        </div>
        <div class="col-span-1">
            <Button>Edit</Button>
        </div>
        <div class="col-span-1">
            <Button>Delete</Button>
        </div>
    {/each}
</div>

<TableSearch hoverable placeholder="Search by name" bind:inputValue={searchTerm}>
    <TableHead>
        <TableHeadCell sort={(a, b) => a.name.localeCompare(b.name)}>Name</TableHeadCell>
        <TableHeadCell class="w-70">
            <span class="sr-only">Edit</span>
        </TableHeadCell>
    </TableHead>
    <TableBody>
        {#each filteredItems as item}
            <TableBodyRow
                    onclick={() => {}}
                    class="cursor-pointer">
                <TableBodyCell>{item.name}</TableBodyCell>
                <TableBodyCell>
                    <Button>Edit</Button>
                    <Button>Delete</Button>
                </TableBodyCell>
            </TableBodyRow>
        {/each}
    </TableBody>
</TableSearch>
