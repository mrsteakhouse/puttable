<script lang="ts">
    import {Heading} from "flowbite-svelte"
    import {ArrowLeftOutline} from "flowbite-svelte-icons"
</script>


<div class="flex flex-row px-10 pb-20">
    <div class="basis-16">
        <a href="/player">
            <ArrowLeftOutline size="xl" class="cursor-pointer"/>
        </a>
    </div>
    <div class="basis-full">
        <Heading tag="h4">
            The player name
        </Heading>
    </div>
</div>


