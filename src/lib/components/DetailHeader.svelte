<script lang="ts">
    import { ArrowLeftOutline, EditSolid } from "flowbite-svelte-icons";
    import { Heading } from "flowbite-svelte";

    let {heading, editLink} = $props();
</script>

<div class="flex flex-row px-2 lg:px-10 md:px-4 pb-20">
    <div class="basis-16">
        <a href="/">
            <ArrowLeftOutline size="xl" class="cursor-pointer"/>
        </a>
    </div>
    <div class="basis-full">
        <Heading tag="h3">
            {heading}
        </Heading>
    </div>
    {#if editLink}
        <div class="basis-10">
            <a href="{editLink}">
                <EditSolid size="lg"/>
            </a>
        </div>
    {/if}
</div>