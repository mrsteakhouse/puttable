<script lang="ts">
    import {Heading} from "flowbite-svelte"
    import {ArrowLeftOutline} from "flowbite-svelte-icons"
    import type {PageProps} from "./$types";


    let  { data }: PageProps = $props();
</script>


<div class="flex flex-row px-10 pb-20">
    <div class="basis-16">
        <a href="/">
            <ArrowLeftOutline size="xl" class="cursor-pointer"/>
        </a>
    </div>
    <div class="basis-full">
        <Heading tag="h3">
            {data.tournament.name}
        </Heading>
    </div>
</div>


