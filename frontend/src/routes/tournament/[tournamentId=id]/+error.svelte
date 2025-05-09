<script lang="ts">
    import DetailHeader from "$lib/DetailHeader.svelte";
    import {page} from "$app/state"
</script>

<DetailHeader heading={page.error.message}/>

The Tournament with the given Id does not exist.