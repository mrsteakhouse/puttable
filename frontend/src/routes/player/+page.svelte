<script lang="ts">
    import {Button, Heading} from "flowbite-svelte";
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
<Heading tag="h3" class="pb-10">List of player</Heading>

{#each filteredItems as item}
    <div class="flex flex-row px-10 py-2">
        <div class="basis-full">
            <a href="/player/view?id={item.id}">{item.name}</a></div>
        <div class="basis-32">
            <Button>Delete</Button>
        </div>
    </div>
{/each}